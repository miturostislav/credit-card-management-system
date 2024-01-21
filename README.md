# RESTful API for a secure credit card management system


## This project uses `node v20`

## Install

```sh
npm install
```

## Run the service

```sh
npm run start_and_mock
```

## Run the tests

```sh
npm run test
```

## REST API
Below are described the successful requests and responses of the REST APIs. REST APIs validate the params and handle the errors but no examples are provided below.

### Get the list of credit card accounts
#### Request
GET: /api/v1/credit_cards
```sh
curl -i -H 'Accept: application/json' http://localhost:3000/api/v1/credit_cards
```
#### Response
```sh
[
  {"id":1,"name":"IOVAN","credit_limit":45,"card_number":"4324323432342324","card_type":"mastercard"},
  ...
]
```
### Get credit card account by id
#### Request
GET: /api/v1/credit_cards/:id
```sh
curl -i -H 'Accept: application/json' http://localhost:3000/api/v1/credit_cards/1
```
#### Response
```sh
{"id":1,"name":"IOVAN","credit_limit":45,"card_number":"4324323432342324","card_type":"mastercard"}
```
### Create credit card account
#### Request
POST: /api/v1/credit_cards
```sh
curl -i -H 'curl -H "Content-Type: application/json" -X POST http://localhost:3000/api/v1/credit_cards -d '{ "name": "FOO", "credit_limit": 120, "card_number": "8764323490342324", "card_type": "visa" }'
```
#### Response
```sh
{"message":"Card has been added successfully"}
```
### Update credit card limit
#### Request
PUT: /api/v1/credit_cards/:id
```sh
curl -H "Content-Type: application/json" -X PUT http://localhost:3000/api/v1/credit_cards/1 -d '{ "credit_limit": 220 }'
```
#### Response
```sh
{"message":"Card has been updated successfully"}
```
### Delete credit card account
#### Request
DELETE: /api/v1/credit_cards/:id
```sh
curl -H "Content-Type: application/json" -X DELETE http://localhost:3000/api/v1/credit_cards/7
```
#### Response
```sh
{"message":"Card has been deleted successfully"}
```
### Charge credit card account
#### Request
POST: /api/v1/credit_cards/:card_number/charge
```sh
curl -H "Content-Type: application/json" -X POST http://localhost:3000/api/v1/credit_cards/8764323490342324/charge -d '{ "amount": 20 }'
```
#### Response
```sh
{"message":"Card has been charged successfully"}
```
### Credit credit card account
#### Request
POST: /api/v1/credit_cards/:card_number/credit
```sh
curl -H "Content-Type: application/json" -X POST http://localhost:3000/api/v1/credit_cards/8764323490342324/credit -d '{ "amount": 20 }'
```
#### Response
```sh
{"message":"Card has been credited successfully"}
```