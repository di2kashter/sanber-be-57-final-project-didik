import express from "express";

import uploadMiddleware from "./middlewares/upload.middleware";
import uploadController from "./controllers/upload.controller";
import productsController from "./controllers/products.controller";
import categoriesController from "./controllers/categories.controller";
import authController from "./controllers/auth.controller"
import authMiddleware from "./middlewares/auth.middleware";
import aclMiddleware from "./middlewares/acl.middleware";
import refreshTokenMiddleware from "./middlewares/refreshToken.middleware";
import orderController from "./controllers/order.controller";

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({
        messagae: "Server is running",
        data: "Ok",
    });
});

router.get("/products", authMiddleware, productsController.findAll);
router.post("/products", authMiddleware, productsController.create);
router.get("/products/:id", authMiddleware, productsController.findOne);
router.put("/products/:id", authMiddleware, productsController.update);
router.delete("/products/:id", authMiddleware, productsController.delete);

//Order
router.get("/order", authMiddleware, orderController.findAll);
router.post("/order", authMiddleware, orderController.createOrder);
router.get("/order/:id", authMiddleware, orderController.findOne);
router.patch("/order/:id", authMiddleware, orderController.update);
router.delete("/order/:id", authMiddleware, orderController.delete);


// CRUD Categories
router.get("/categories", categoriesController.findAll);
router.post("/categories", categoriesController.create);
router.get("/categories/:id", categoriesController.findOne);
router.put("/categories/:id", categoriesController.update);
router.delete("/categories/:id", categoriesController.delete);

// auth
router.post("/auth/login", authController.login);
router.post("/auth/refrestoken", refreshTokenMiddleware, authController.refreshToken);
router.post("/auth/register", authController.register);
router.get("/auth/me", [authMiddleware, aclMiddleware(["admin", "user"])], authController.me);
router.put("/auth/profile", authMiddleware, authController.profile);


router.post("/upload", uploadMiddleware.single, uploadController.single);
router.post("/uploads", uploadMiddleware.multiple, uploadController.multiple);

export default router;
