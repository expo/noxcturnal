# Builds the Hermes parser and the erasure shim as a single static archive.
#
# Hermes is embedded with `add_subdirectory` rather than compiled from a
# curated file list, because `external/llvh/include/llvh/Config/config.h.cmake`
# and `llvm-config.h.cmake` are CMake-generated: a hand-rolled build would mean
# maintaining generated config headers per platform.
#
# Only the parser half is built. `hermesSema` is not linked — erasure reads
# spans and never asks Hermes a semantic question — and neither is the VM.

cmake_minimum_required(VERSION 3.21)
project(hermes_flow_shim LANGUAGES C CXX)

set(HERMES_SOURCE_DIR "" CACHE PATH "Hermes checkout at the pinned release tag")
if(NOT HERMES_SOURCE_DIR)
  message(FATAL_ERROR "HERMES_SOURCE_DIR must be set")
endif()

# Parser-only configuration, forced so an inherited cache cannot weaken it.
#
# UNICODE_LITE stubs out the locale-sensitive Intl entry points, which the
# parser never calls: `JSLexer.cpp` uses only `CharacterProperties.h`, which is
# a table compiled unconditionally. Turning it on is what drops the CoreFoundation
# framework on Darwin and the ICU dependency everywhere else — the latter matters
# most for the two musl targets.
#
# Boost.Context backs `StackExecutor`, which nothing on the parse path touches,
# and it is hand-written assembly per architecture. Dropping it removes an
# assembler port from the Windows-on-ARM cross-build.
set(HERMES_UNICODE_LITE ON CACHE BOOL "" FORCE)
set(HERMES_ENABLE_INTL OFF CACHE BOOL "" FORCE)
set(HERMES_ENABLE_TEST_SUITE OFF CACHE BOOL "" FORCE)
set(HERMES_ALLOW_BOOST_CONTEXT 0 CACHE STRING "" FORCE)
set(HERMES_BUILD_APPLE_FRAMEWORK OFF CACHE BOOL "" FORCE)
set(HERMES_BUILD_SHARED_JSI OFF CACHE BOOL "" FORCE)

add_subdirectory("${HERMES_SOURCE_DIR}" hermes EXCLUDE_FROM_ALL)

# `add_hermes_library` builds each library as an OBJECT library plus a thin
# static wrapper, so the objects can be gathered here into one archive. That is
# worth doing: a Rust build script can only hand the linker `-l` flags in the
# order it emits them, and a single archive removes the question of whether the
# host linker resolves a cycle between two of them.
set(HERMES_OBJECT_LIBRARIES
  hermesParser_obj
  hermesAST_obj
  hermesSupport_obj
  hermesRegex_obj
  hermesPlatformUnicode_obj
)

set(HERMES_OBJECTS "")
foreach(library IN LISTS HERMES_OBJECT_LIBRARIES)
  list(APPEND HERMES_OBJECTS "$<TARGET_OBJECTS:${library}>")
endforeach()

add_library(hermes_flow_shim STATIC
  hermes_flow_shim.cpp
  "${HERMES_SOURCE_DIR}/tools/hermes-parser/HermesParserDiagHandler.cpp"
  ${HERMES_OBJECTS}
)

# The shim includes Hermes headers whose layout depends on definitions Hermes
# applies with directory-scoped `add_definitions` — `STATIC_HERMES` and
# `HERMES_CHECK_NATIVE_STACK` among them. Copying the directory's definitions
# verbatim keeps this translation unit ABI-identical to the objects it is
# archived with; spelling them out again would be a silent-miscompile waiting
# for the next Hermes bump.
get_directory_property(HERMES_COMPILE_DEFINITIONS
  DIRECTORY "${HERMES_SOURCE_DIR}" COMPILE_DEFINITIONS)
target_compile_definitions(hermes_flow_shim PRIVATE ${HERMES_COMPILE_DEFINITIONS})

target_include_directories(hermes_flow_shim PRIVATE
  "${CMAKE_CURRENT_SOURCE_DIR}"
  "${HERMES_SOURCE_DIR}/include"
  "${HERMES_SOURCE_DIR}/tools/hermes-parser"
  "${HERMES_SOURCE_DIR}/external/llvh/include"
  "${CMAKE_CURRENT_BINARY_DIR}/hermes/include"
  "${CMAKE_CURRENT_BINARY_DIR}/hermes/external/llvh/include"
)

# Match Hermes' own exception and RTTI policy for the same ABI reason.
if(MSVC)
  target_compile_options(hermes_flow_shim PRIVATE /EHs-c- /GR-)
else()
  target_compile_options(hermes_flow_shim PRIVATE -fno-exceptions -fno-rtti)
endif()
set_property(TARGET hermes_flow_shim PROPERTY POSITION_INDEPENDENT_CODE ON)
set_property(TARGET hermes_flow_shim PROPERTY CXX_STANDARD 17)

# dtoa and the two LLVH archives are plain static libraries rather than object
# libraries, so they stay separate. They sit at the bottom of the dependency
# order, which is why three `-l` flags in a fixed order are enough. Linking
# them here does not merge them into the archive; it records the dependency, so
# that Hermes' `EXCLUDE_FROM_ALL` subdirectory still builds them.
target_link_libraries(hermes_flow_shim PRIVATE dtoa LLVHSupport LLVHDemangle)

# rustc performs the final link and does not know this is a C++ project, so the
# build script has to name the C++ runtime itself. Rather than guess it from the
# target triple — which gets libstdc++ versus libc++ wrong as soon as a musl
# target is cross-built with a clang-based toolchain — hand over what CMake
# derived by running the compiler's own link line.
string(REPLACE ";" "\n" HERMES_FLOW_CXX_LIBRARIES "${CMAKE_CXX_IMPLICIT_LINK_LIBRARIES}")
string(REPLACE ";" "\n" HERMES_FLOW_CXX_DIRECTORIES "${CMAKE_CXX_IMPLICIT_LINK_DIRECTORIES}")
file(WRITE "${CMAKE_CURRENT_BINARY_DIR}/cxx-link-libraries.txt" "${HERMES_FLOW_CXX_LIBRARIES}\n")
file(WRITE "${CMAKE_CURRENT_BINARY_DIR}/cxx-link-directories.txt" "${HERMES_FLOW_CXX_DIRECTORIES}\n")
install(FILES
  "${CMAKE_CURRENT_BINARY_DIR}/cxx-link-libraries.txt"
  "${CMAKE_CURRENT_BINARY_DIR}/cxx-link-directories.txt"
  DESTINATION share)

install(TARGETS hermes_flow_shim ARCHIVE DESTINATION lib)
install(FILES
  "$<TARGET_FILE:dtoa>"
  "$<TARGET_FILE:LLVHSupport>"
  "$<TARGET_FILE:LLVHDemangle>"
  DESTINATION lib)
install(FILES hermes_flow_shim.h DESTINATION include)
