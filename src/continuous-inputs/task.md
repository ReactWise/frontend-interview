# Frontend Interview Task

Create a form that manages a user's "Continuous Inputs". In the last 5 minutes, review the code like a PR and consider the following:

- usability
- accessibility
- maintainability
- use of components
- performance

## Requirements

### 1. Create

Build a form to create a Continuous Input with the following fields:

- `name`
- `unit`
- `precision`
- `min`
- `max`
- `is_discrete` (continuous or discrete)
  - if discrete, also ask for the `step_size`

### 2. Submit

When the form is submitted, call a dummy submit function that console logs the data.

### 3. Pre-Fill

Load existing data and pre-fill the form.

### 4. Live Updates

Remove the submit button and switch to live updates. Any changes to an input field should automatically trigger a "patch" mutation (a dummy function that console logs the data)

### 5. Multiple continuous inputs

Implement a way to manage multiple continuous inputs. Needs an add, delete and edit.
