# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e8]: ERP System Login
  - generic [ref=e10]:
    - generic [ref=e11]:
      - generic [ref=e13]: "* Email :"
      - textbox "Email" [ref=e17]
    - generic [ref=e18]:
      - generic [ref=e20]: "* Password :"
      - textbox "Password" [ref=e24]
    - button "Log in" [disabled] [ref=e26]:
      - generic: Log in
    - generic [ref=e27]:
      - text: Don't have an account?
      - link "Register here" [ref=e28] [cursor=pointer]:
        - /url: /register
```