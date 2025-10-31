# Frontend Interview Task

Your task is to build and review a form that manages a user's **Continuous Inputs**. In the last 5 allotted minutes, perform a code review (as if it were a PR) and consider:

- **Usability**  
- **Accessibility**  
- **Maintainability**  
- **Use of Components**  
- **Performance**

---

## Requirements

### 1. Create

Build a form that allows users to create a **Continuous Input** with the following fields:

- `name`
- `unit`
- `precision`
- `min`
- `max`
- `is_discrete` (whether the input is continuous or discrete)
  - If discrete, also include a `step_size` field.

---

### 2. Submit

When the form is submitted, call a dummy **CREATE** function that simply logs the form data to the console.

---

### 3. Pre-Fill

Simulate loading existing data by calling a dummy **GET** function that logs a message to the console. Use this data to pre-fill the form fields.

---

### 4. Live Updates

Remove the submit button and switch to a **live updates** mode.  
Any changes to an input field should automatically trigger a dummy **PATCH** function that simply logs to the console.

---

### 5. Multiple Continuous Inputs

Add support for managing **multiple continuous inputs**.  
Users should be able to **add**, **edit**, and **delete** inputs.
