let validator = require("../utils/validators")
let cartModel = require("../models/cartModel")
let userModel = require("../models/userModel")
let productModel = require("../models/productModel")

//===========create cart ================
const createCart = async function (req, res) {
    try { //POST /users/:userId/cart (Add to cart)

        /*
        Create a cart for the user if it does not exist. Else add product(s) in cart.
        - Get cart id in request body.
        - Get productId in request body.
        - 
        - Add a product(s) for a user in the cart.
        - 
        - 
        - Make sure the product(s) are valid and not deleted.
        - Get product(s) details in response body.
        */

        let userId = req.params.userId
        let cartId = req.body.cartId
        let productId = req.body.productId

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is not valid" })
        }
        let userExist = await userModel.findById(userId)
        if (userExist == null) {
            return res.status(400).send({ status: false, message: "user is not exist" })
        }

        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(400).send({ status: false, message: "product dont exist" })
        }

        let cartExist = await cartModel.findOne({ userId: userId })

        // if (!cartExist) {
        //     return res.status(400).send({ status: false, message: "cart not exist" })
        // }
        if (req.userId != userId) {
            return res.status(400).send({ status: false, msg: "unauthorized" })
        }
        if (cartExist) {
            if (!cartId) return { msg: "cartid Must be present" }

            let arr = cartExist.items
            let flag = true
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == productId) {
                    arr[i].quantity++
                    flag = false
                }
            }
            if (flag) {
                let obj = { productId: productId, quantity: 1 }
                arr.push(obj)
            }
            totalPrice = cartExist.totalPrice + product.price
            totalItems = items.length

            let dbcart = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { items: arr, totalPrice: totalPrice, totalItems: totalItems } }, { new: true })

        }
        if (!cartExist) {
            items = [{ productId: productId, quantity: 1 }]
            totalPrice = product.price
            totalItems = items.length

            const data = { userId, items, totalPrice, totalItems }
            const createCart = await cartModel.create(data)

            return res.status(200).send({ status: true, message: "successfully created", data: createCart })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: message.err })
    }
}
//===========get cart=====================
const getCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is not valid" })
        }
        let gExist = await userModel.findById(userId)
        if (gExist === null) {
            return res.status(400).send({ status: false, message: "user is not exist" })
        }

        let getCartdetails = await cartModel.find({ userId: userId })

        if (!getCartdetails) { return res.status(400).send({ staus: false, message: "user doesn't exist" }) }

        return res.status(200).send({ status: true, message: "Product Details", data: getCartdetails })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//=============delete cart==================
const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: true, message: "userID is not valid" })
        }
        if (req.userId != userId) {
            { return res.status(403).send({ status: false, message: "unauthorised" }) }
        }

        let gExist = await cartModel.find({ userId: userId })
        if (gExist === null) {
            return res.status(400).send({ status: false, message: "cart is not exist" })
        }

        const dExist = await cartModel.findOneAndUpdate({ _id: userId, isDeleted: false }, { $set: { items: [], totalItems: 0, totalPrice: 0 } }, { returnOriginal: false })
        if (dExist == null) {
            return res.status(400).send({ status: false, message: "cart does not exist " })
        }
        return res.status(200).send({ status: true, message: "cart is succesfully deleted", data: dExist })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = {
    getCart,
    deleteCart,
    createCart
}