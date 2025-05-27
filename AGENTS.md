# Coding Style Guide for AI Agents

This document outlines the coding style preferences that should be followed when generating or modifying code.

## General Formatting

- Use tabs for indentation (4 spaces width)
- Use double quotes for strings
- No semicolons required
- Use LF (Unix-style) line endings
- No trailing commas in objects and arrays

## Code Style Examples

### JavaScript/TypeScript

```javascript
// Correct
const example = { name: "test", value: 42 }

function exampleFunction(param1, param2) {
    return { result: param1 + param2 }
}

// One-line when it makes sense
const simpleObject = { name: "test", value: 42 }
const simpleArray = [1, 2, 3]
const simpleFunction = (x) => x * 2

// Multi-line when more complex
const complexObject = {
    name: "test",
    value: 42,
    nested: {
        property: "value"
    }
}

// Incorrect
const example = {
    name: 'test',
    value: 42,
};

function exampleFunction(param1, param2) {
    return {
        result: param1 + param2,
    };
}
```

## Key Rules

1. **Indentation**: Always use tabs (4 spaces width)
2. **Quotes**: Use double quotes (`"`) for strings
3. **Semicolons**: Not required
4. **Line Endings**: Use LF (Unix-style) line endings
5. **Trailing Commas**: Not used
6. **One-line vs Multi-line**:
   - Use one-line for simple declarations
   - Use multi-line for complex structures
   - Break into multiple lines when it improves readability

## Comments and Documentation
- Write clear and concise comments (entirely in lowercase)
- Document complex logic or non-obvious decisions
- Keep documentation up to date

## Best Practices

- Write clean, maintainable code
- Follow the DRY (Don't Repeat Yourself) principle
- Keep functions small and focused
- Use meaningful variable names
- Handle errors appropriately
- Write testable code

## One-line vs Multi-line Guidelines

Use one-line format for:
- Simple object literals with few properties
- Simple array declarations
- Simple function expressions
- Simple variable declarations

Only use multi-line format for:
- Complex expressions
- Or when readability would be improved by breaking into multiple lines