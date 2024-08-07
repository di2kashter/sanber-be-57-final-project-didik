# sanber-be-57-final-project-didik

## Description

membuat endpoint user, product, categories dan order

## Deployment
 URL:

- **Live URL**: [https://sanber-be-57-final-project-didik-production.up.railway.app/](https://sanber-be-57-final-project-didik-production.up.railway.app/)



## API Endpoints

### 1. **auth Endpoints**

- **GET** `/api/auth`
  - **Description**: register users.
  - **Response**: Returns an array of users.

- **POST** `/api/auth/register`
  - **Description**: Create a new user.
  - **Request Body**: 
    ```json
    {
        "fullName":"Didik Setiawan",
        "username":"didikuser1",
        "email":"imdidiksetiawan@mail.com",
        "password":"12345678",
        "roles":"user"
    }
    ```
  - **Response**: Returns the created user details.

  - **POST** `/api/auth/login`
    - **Description**: Login User.
    - **Request Body**: 
        ```json
        {
        "email": "mail@gmail.com",
        "password": "12345678"
        }
        ```
    - **Response**: Returns Message.
        ```json
        {
            "token":"",
            "refreshToken":""
        }
  - **PUT** `/api/auth/profile`
    - **Description**: Update Profile.
    - **Headers**: 
    - `Authorization`: Bearer `YOUR_JWT_TOKEN`
    - **Request Body**: 
        ```json

            {
                    "fullName": "didik Setiawan",
                    "password": "12341234"
            }


    - **GET** `/api/auth/me`
        - **Description**: Update Profile.
        - **Headers**: 
        - `Authorization`: Bearer `YOUR_JWT_TOKEN`
        - **respon Body**: 
        ```json

            {
                    "message": "User details",
                    "data": {
                        "_id": "66b32a73d1c9be054fb39f44",
                        "fullName": "didik Setiawan",
                        "username": "didikuser1",
                        "email": "mail@gmail.com",
                        "roles": [
                            "user"
                        ],
                        "profilePicture": "default.jpg",
                        "createdAt": "2024-08-07T08:04:03.834Z",
                        "updatedAt": "2024-08-07T09:29:27.778Z",
                        "__v": 0
                    }
            }

    - **POST** `/api/auth/refreshtoken`
        - **Description**: mendapatkan update token.
        - **Headers**: 
        - `Authorization`: Bearer `YOUR_JWT_TOKEN`
        - **Request Body**: 
            ```json

                {
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YjMyYTczZDFjOWJlMDU0ZmIzOWY0NCIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNzIzMDIxNjA2LCJleHAiOjE3MjMwMjUyMDZ9.imBoimcVHN3dM4B_heNXJ8wUy9_rIIQ8SP1qaSpVxng"
                }

### 2. **Product Endpoints**
  - **GET** `/api/products`
        - **GET** `/api/products/:id`
        - **POST** `/api/products`
        - **PUT** `/api/products/:id`
        - **DELETE** `/api/products/:id`

### 3. **Categories Endpoints**
  - **GET** `/api/categories`
        - **GET** `/api/categories/:id`
        - **POST** `/api/categories`
        - **PUT** `/api/categories/:id`
        - **DELETE** `/api/categories/:id`

### 4. **Order Endpoints**
   - **GET** `/api/order`
   - **GET** `/api/order/:id`
   - **POST** `/api/order`
            - **Headers**: 
            - `Authorization`: Bearer `YOUR_JWT_TOKEN`
            - **Request Body**: 
                ```json
                
                {
                    "orderItems": [
                        {
                        "productId": "66b0b7d1a531d1ebfbfb191a",
                        "qty": 1
                        },
                        {
                        "productId": "66b0b781a531d1ebfbfb1918",
                        "qty": 1
                        }
                    ],
                    "status": "pending"
                    } 
        - **PATCH** `/api/order/:id`
        - **DELETE** `/api/order/:id`

    ### 5. **Upload Endpoints**
        - **POST** `/api/upload` (singgle)
        - **POST** `/api/uploads` (multiple)