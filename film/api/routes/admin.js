const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const Admin = require("../models/admin")

router.post('/signup', (req, res, next) => {
    //Ayni mail ile birden fazla kullanicinin kaydolmasini engellemek:
    Admin.find({ email: req.body.email })
        .exec()
        .then(admin => {
            if (admin.length >= 1) {
                return res.status(209).json({
                    message: "E-mail mevcut!"
                })
            }
            else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const admin = new Admin({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        })
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "Kullanıcı oluşturuldu!"
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })
})

router.post('/login', (req, res, next) => {
    Admin.find({ email: req.body.email })
        .exec()
        .then(admin => {
            if (admin.length < 1) {
                return res.status(404).json({
                    message: "Yetkilendirme basarısız!"
                })
            }
            bcrypt.compare(req.body.password, admin[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Yetkilendirme basarısız!'
                    })
                }
                if (result) {
                    const token = jwt.sign({
                        email: admin[0].email,
                        adminId: admin[0]._id
                    }, process.env.JWT_KEY, {
                        expiresIn: "1h"
                    })
                    return res.status(200).json({
                        message: "Giris basarili.",
                        token: token
                    })
                }
                res.status(401).json({
                    message: "Yetkilendirme basarisiz!"
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:adminId', (req, res, next) => {
    Admin.remove({ _id: req.params.adminId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Kullanici silindi."
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;