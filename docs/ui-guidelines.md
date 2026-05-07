# UI Guidelines: TODO App

## Component Library

- Use [Material UI (MUI)](https://mui.com/) for all UI components
- Do not build custom components when an equivalent MUI component exists
- Use MUI's `ThemeProvider` to apply consistent theming across the app

## Color Palette

| Role        | Color Token         | Hex       |
|-------------|---------------------|-----------|
| Primary     | `primary.main`      | `#1976D2` |
| Secondary   | `secondary.main`    | `#9C27B0` |
| Background  | `background.default`| `#F5F5F5` |
| Surface     | `background.paper`  | `#FFFFFF` |
| Error/Overdue | `error.main`      | `#D32F2F` |
| Success     | `success.main`      | `#388E3C` |

## Typography

- Use the MUI default typography scale (Roboto font)
- Task titles: `body1` (16px, regular)
- Section headings: `h6` (20px, medium)
- Supporting text (due dates, counts): `caption` or `body2`

## Button Styles

- Primary actions (e.g., Add Task): MUI `Button` with `variant="contained"` and `color="primary"`
- Destructive actions (e.g., Delete, Clear Completed): MUI `Button` with `color="error"`
- Secondary/cancel actions: MUI `Button` with `variant="outlined"`
- Icon-only actions (e.g., edit, delete on a task row): MUI `IconButton`

## Layout

- Center the app content with a maximum width of `600px` on desktop
- Use MUI `Stack` or `Box` for spacing and layout; avoid raw CSS margin/padding where possible
- Tasks are displayed in a MUI `List` with `ListItem` components

## Task Item Appearance

- Completed tasks display their title with a strikethrough style and reduced opacity (`0.5`)
- Overdue tasks display the due date in `error.main` red
- High-priority tasks display a colored indicator (red chip); medium is yellow; low is grey

## Accessibility

- All interactive elements must have accessible labels (`aria-label` or visible text)
- Maintain a minimum color contrast ratio of **4.5:1** for normal text (WCAG AA)
- All form inputs must have associated `<label>` elements or `aria-label` attributes
- The app must be fully navigable by keyboard alone
- Use semantic HTML elements (`<main>`, `<header>`, `<ul>`, `<li>`) where appropriate

## Responsiveness

- The app must be usable on screens as narrow as `320px`
- Use MUI's responsive `sx` prop or `breakpoints` rather than custom media queries
