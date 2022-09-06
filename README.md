## Users Microservice

- This service is responsible for all User related information
- It stores user data in MongoDB
- It provides REST API for
  - signup
  - login
  - verification
  - transfer
  - adding beneficiery
  - etc
- It is accessed by [Frontend Microservice](https://github.com/furqansays/coinchain) through REST API.
- It communicates with [Blockchain Microservice](https://github.com/furqansays/coincrypto) through REST API for all Blockchain related data.
