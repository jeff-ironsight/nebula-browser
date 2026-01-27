<!--suppress HtmlDeprecatedAttribute -->
<p align="center">
  <img width="450" height="128" alt="Nebula Logo" src="https://github.com/user-attachments/assets/fd7410c7-322c-4ec2-a17b-563b58081cfe" />
</p>

<p align="center">
  <a href="https://libraries.io/github/jeff-ironsight/nebula-browser">
    <img src="https://img.shields.io/librariesio/github/jeff-ironsight/nebula-browser" alt="Dependencies" />
  </a>
  &nbsp;
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-20.x-43853d?logo=node.js&logoColor=white" alt="Node 20" />
  </a>
  &nbsp;
  <img src="https://visitorbadge.vercel.app//api/badge/02667eca-8f3d-4d1f-aed9-27552f4cea97?style=flat&color=8eccff&labelColor=5b5b5b" alt="Visits" />
  &nbsp;
  <a href="https://github.com/jeff-ironsight/nebula-browser/actions/workflows/ci.yml">
    <img src="https://github.com/jeff-ironsight/nebula-browser/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI" />
  </a>
</p>

---

A **Discord-inspired test client** for [**nebula-gateway**](https://github.com/jeff-ironsight/nebula-gateway) built with **Vite** and **Vue 3**.

Nebula Browser focuses on exercising the gateway protocol:

- Auth0 login
- WebSocket identify and channel subscribe
- Message create and dispatch handling
- Minimal UI to validate gateway behavior

This project is intentionally **client-first** and designed as a lightweight harness for validating gateway changes.
