# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e7]: ERP System Login
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e12]: "* Email :"
      - textbox "Email" [ref=e16]
    - generic [ref=e17]:
      - generic [ref=e19]: "* Password :"
      - textbox "Password" [ref=e23]
    - button "Log in" [disabled] [ref=e25]:
      - generic: Log in
    - generic [ref=e26]:
      - text: Don't have an account?
      - link "Register here" [ref=e27] [cursor=pointer]:
        - /url: /register
```