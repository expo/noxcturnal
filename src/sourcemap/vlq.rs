pub(crate) fn encode(mut value: i64, output: &mut String) {
    const CHARS: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let negative = value < 0;
    if negative {
        value = -value;
    }
    let mut encoded = (value << 1) | i64::from(negative);
    loop {
        let mut digit = (encoded & 31) as usize;
        encoded >>= 5;
        if encoded != 0 {
            digit |= 32;
        }
        output.push(CHARS[digit] as char);
        if encoded == 0 {
            break;
        }
    }
}

pub(crate) fn encoded_len(value: i64) -> usize {
    let mut encoded = (value.unsigned_abs() << 1) | u64::from(value < 0);
    let mut len = 1;
    while encoded >= 32 {
        encoded >>= 5;
        len += 1;
    }
    len
}

pub(crate) fn decode(bytes: &[u8], cursor: &mut usize) -> Option<i64> {
    let mut value = 0i64;
    let mut shift = 0;
    loop {
        let digit = decode_char(*bytes.get(*cursor)?)?;
        *cursor += 1;
        value |= (digit & 31) << shift;
        if digit & 32 == 0 {
            return Some(if value & 1 == 1 {
                -(value >> 1)
            } else {
                value >> 1
            });
        }
        shift += 5;
    }
}

fn decode_char(value: u8) -> Option<i64> {
    match value {
        b'A'..=b'Z' => Some(i64::from(value - b'A')),
        b'a'..=b'z' => Some(i64::from(value - b'a') + 26),
        b'0'..=b'9' => Some(i64::from(value - b'0') + 52),
        b'+' => Some(62),
        b'/' => Some(63),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_signed_and_multibyte_values() {
        for value in [i32::MIN as i64, -123_456, -1, 0, 1, 31, 32, 123_456] {
            let mut encoded = String::new();
            encode(value, &mut encoded);
            assert_eq!(encoded.len(), encoded_len(value));
            let mut cursor = 0;
            assert_eq!(decode(encoded.as_bytes(), &mut cursor), Some(value));
            assert_eq!(cursor, encoded.len());
        }
    }

    #[test]
    fn decodes_every_base64_character_class() {
        for encoded in ["A", "a", "0A", "+A", "/A"] {
            let mut cursor = 0;
            assert!(
                decode(encoded.as_bytes(), &mut cursor).is_some(),
                "{encoded}"
            );
            assert_eq!(cursor, encoded.len());
        }
    }

    #[test]
    fn rejects_invalid_and_truncated_sequences() {
        let mut cursor = 0;
        assert_eq!(decode(b"!", &mut cursor), None);
        assert_eq!(cursor, 0);

        let mut cursor = 0;
        assert_eq!(decode(b"g", &mut cursor), None);
        assert_eq!(cursor, 1);
    }
}
