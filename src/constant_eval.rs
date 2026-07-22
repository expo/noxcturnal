use oxc_ast::{AstKind, ast::Expression};
use oxc_syntax::operator::{BinaryOperator, LogicalOperator, UnaryOperator};

#[derive(Clone, Debug)]
pub(crate) enum EvaluatedConstant {
    Null,
    Boolean(bool),
    Number(f64),
    String(String),
}

impl EvaluatedConstant {
    pub(crate) fn kind(&self) -> &'static str {
        match self {
            Self::Null => "null",
            Self::Boolean(_) => "boolean",
            Self::Number(_) => "number",
            Self::String(_) => "string",
        }
    }

    pub(crate) fn encode(&self) -> String {
        match self {
            Self::Null => String::new(),
            Self::Boolean(value) => value.to_string(),
            Self::Number(value) => js_number_string(*value),
            Self::String(value) => value.clone(),
        }
    }

    fn truthy(&self) -> bool {
        match self {
            Self::Null => false,
            Self::Boolean(value) => *value,
            Self::Number(value) => *value != 0.0 && !value.is_nan(),
            Self::String(value) => !value.is_empty(),
        }
    }

    fn number(&self) -> Option<f64> {
        match self {
            Self::Null => Some(0.0),
            Self::Boolean(value) => Some(f64::from(*value)),
            Self::Number(value) => Some(*value),
            Self::String(value) if value.trim().is_empty() => Some(0.0),
            Self::String(value) => value.trim().parse().ok(),
        }
    }
}

pub(crate) fn constant_for_kind(kind: AstKind<'_>) -> Option<EvaluatedConstant> {
    match kind {
        AstKind::NullLiteral(_) => Some(EvaluatedConstant::Null),
        AstKind::BooleanLiteral(value) => Some(EvaluatedConstant::Boolean(value.value)),
        AstKind::NumericLiteral(value) => Some(EvaluatedConstant::Number(value.value)),
        AstKind::StringLiteral(value) => Some(EvaluatedConstant::String(value.value.to_string())),
        AstKind::UnaryExpression(value) => evaluate_expression(&value.argument)
            .and_then(|argument| evaluate_unary(value.operator, argument)),
        AstKind::BinaryExpression(value) => evaluate_binary(
            value.operator,
            evaluate_expression(&value.left)?,
            evaluate_expression(&value.right)?,
        ),
        AstKind::LogicalExpression(value) => {
            evaluate_logical(value.operator, &value.left, &value.right)
        }
        AstKind::ConditionalExpression(value) => {
            if evaluate_expression(&value.test)?.truthy() {
                evaluate_expression(&value.consequent)
            } else {
                evaluate_expression(&value.alternate)
            }
        }
        AstKind::ParenthesizedExpression(value) => evaluate_expression(&value.expression),
        AstKind::SequenceExpression(value) => evaluate_sequence(&value.expressions),
        _ => None,
    }
}

fn evaluate_expression(expression: &Expression<'_>) -> Option<EvaluatedConstant> {
    match expression {
        Expression::NullLiteral(_) => Some(EvaluatedConstant::Null),
        Expression::BooleanLiteral(value) => Some(EvaluatedConstant::Boolean(value.value)),
        Expression::NumericLiteral(value) => Some(EvaluatedConstant::Number(value.value)),
        Expression::StringLiteral(value) => {
            Some(EvaluatedConstant::String(value.value.to_string()))
        }
        Expression::UnaryExpression(value) => evaluate_expression(&value.argument)
            .and_then(|argument| evaluate_unary(value.operator, argument)),
        Expression::BinaryExpression(value) => evaluate_binary(
            value.operator,
            evaluate_expression(&value.left)?,
            evaluate_expression(&value.right)?,
        ),
        Expression::LogicalExpression(value) => {
            evaluate_logical(value.operator, &value.left, &value.right)
        }
        Expression::ConditionalExpression(value) => {
            if evaluate_expression(&value.test)?.truthy() {
                evaluate_expression(&value.consequent)
            } else {
                evaluate_expression(&value.alternate)
            }
        }
        Expression::ParenthesizedExpression(value) => evaluate_expression(&value.expression),
        Expression::SequenceExpression(value) => evaluate_sequence(&value.expressions),
        Expression::TSAsExpression(value) => evaluate_expression(&value.expression),
        Expression::TSSatisfiesExpression(value) => evaluate_expression(&value.expression),
        Expression::TSTypeAssertion(value) => evaluate_expression(&value.expression),
        Expression::TSNonNullExpression(value) => evaluate_expression(&value.expression),
        _ => None,
    }
}

fn evaluate_sequence(expressions: &[Expression<'_>]) -> Option<EvaluatedConstant> {
    let mut result = None;
    for expression in expressions {
        result = Some(evaluate_expression(expression)?);
    }
    result
}

fn evaluate_unary(operator: UnaryOperator, value: EvaluatedConstant) -> Option<EvaluatedConstant> {
    match operator {
        UnaryOperator::LogicalNot => Some(EvaluatedConstant::Boolean(!value.truthy())),
        UnaryOperator::UnaryPlus => Some(EvaluatedConstant::Number(value.number()?)),
        UnaryOperator::UnaryNegation => Some(EvaluatedConstant::Number(-value.number()?)),
        UnaryOperator::BitwiseNot => Some(EvaluatedConstant::Number(
            (!(value.number()? as i32)) as f64,
        )),
        _ => None,
    }
}

fn evaluate_logical(
    operator: LogicalOperator,
    left: &Expression<'_>,
    right: &Expression<'_>,
) -> Option<EvaluatedConstant> {
    let left = evaluate_expression(left)?;
    match operator {
        LogicalOperator::Or if left.truthy() => Some(left),
        LogicalOperator::And if !left.truthy() => Some(left),
        LogicalOperator::Coalesce if !matches!(left, EvaluatedConstant::Null) => Some(left),
        _ => evaluate_expression(right),
    }
}

fn evaluate_binary(
    operator: BinaryOperator,
    left: EvaluatedConstant,
    right: EvaluatedConstant,
) -> Option<EvaluatedConstant> {
    use BinaryOperator as Op;

    if operator == Op::Addition
        && (matches!(left, EvaluatedConstant::String(_))
            || matches!(right, EvaluatedConstant::String(_)))
    {
        return Some(EvaluatedConstant::String(format!(
            "{}{}",
            constant_string(&left)?,
            constant_string(&right)?
        )));
    }
    if matches!(
        operator,
        Op::StrictEquality | Op::StrictInequality | Op::Equality | Op::Inequality
    ) {
        let equal = constants_equal(&left, &right)?;
        return Some(EvaluatedConstant::Boolean(
            if matches!(operator, Op::StrictInequality | Op::Inequality) {
                !equal
            } else {
                equal
            },
        ));
    }

    let left = left.number()?;
    let right = right.number()?;
    let value = match operator {
        Op::Addition => EvaluatedConstant::Number(left + right),
        Op::Subtraction => EvaluatedConstant::Number(left - right),
        Op::Multiplication => EvaluatedConstant::Number(left * right),
        Op::Division => EvaluatedConstant::Number(left / right),
        Op::Remainder => EvaluatedConstant::Number(left % right),
        Op::Exponential => EvaluatedConstant::Number(left.powf(right)),
        Op::LessThan => EvaluatedConstant::Boolean(left < right),
        Op::LessEqualThan => EvaluatedConstant::Boolean(left <= right),
        Op::GreaterThan => EvaluatedConstant::Boolean(left > right),
        Op::GreaterEqualThan => EvaluatedConstant::Boolean(left >= right),
        Op::ShiftLeft => EvaluatedConstant::Number(((left as i32) << ((right as u32) & 31)) as f64),
        Op::ShiftRight => {
            EvaluatedConstant::Number(((left as i32) >> ((right as u32) & 31)) as f64)
        }
        Op::ShiftRightZeroFill => {
            EvaluatedConstant::Number(((left as u32) >> ((right as u32) & 31)) as f64)
        }
        Op::BitwiseOR => EvaluatedConstant::Number(((left as i32) | (right as i32)) as f64),
        Op::BitwiseXOR => EvaluatedConstant::Number(((left as i32) ^ (right as i32)) as f64),
        Op::BitwiseAnd => EvaluatedConstant::Number(((left as i32) & (right as i32)) as f64),
        _ => return None,
    };
    Some(value)
}

fn constants_equal(left: &EvaluatedConstant, right: &EvaluatedConstant) -> Option<bool> {
    match (left, right) {
        (EvaluatedConstant::Null, EvaluatedConstant::Null) => Some(true),
        (EvaluatedConstant::Boolean(left), EvaluatedConstant::Boolean(right)) => {
            Some(left == right)
        }
        (EvaluatedConstant::Number(left), EvaluatedConstant::Number(right)) => Some(left == right),
        (EvaluatedConstant::String(left), EvaluatedConstant::String(right)) => Some(left == right),
        _ => None,
    }
}

fn constant_string(value: &EvaluatedConstant) -> Option<String> {
    match value {
        EvaluatedConstant::Null => Some("null".into()),
        EvaluatedConstant::Boolean(value) => Some(value.to_string()),
        EvaluatedConstant::Number(value)
            if *value == 0.0
                || (value.is_finite() && value.abs() >= 1e-6 && value.abs() < 1e21) =>
        {
            Some(js_number_string(*value))
        }
        EvaluatedConstant::Number(_) => None,
        EvaluatedConstant::String(value) => Some(value.clone()),
    }
}

fn js_number_string(value: f64) -> String {
    if value.is_nan() {
        "NaN".into()
    } else if value == f64::INFINITY {
        "Infinity".into()
    } else if value == f64::NEG_INFINITY {
        "-Infinity".into()
    } else if value == 0.0 {
        "0".into()
    } else {
        value.to_string()
    }
}
