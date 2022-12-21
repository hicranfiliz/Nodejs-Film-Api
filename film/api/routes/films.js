const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const multer = require("multer")
const checkAuth = require("../middleware/check-auth")

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, new Date().toISOString() + file.originalname)
//     }
// })

// const fileFilter = (req, file, cb) => {
//     //dosyayi reddetmek:
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true)
//     } else {
//         cb(null, false)
//     }
// }

// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 1024 * 1024 * 5
//     }, 
//     fileFilter: fileFilter
// })

//const upload = multer({ dest: '/uploads/' })

const Film = require("../models/film")

router.get('/', checkAuth, (req, res, next) => {
    Film.find()
        //.select("name price _id")
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        type: doc.type,
                        //productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/films/' + doc._id
                        }
                    }
                })
            }
            //if (docs.length >= 0) {
            res.status(200).json(response)
            //} else {
            // res.status(404).json({
            //   message: "No entries found"
            //})
            //}
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.post('/', checkAuth,
    //upload.single('productImage'),
    (req, res, next) => {
        //console.log(req.file);
        const film = new Film({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            type: req.body.type,
            // productImage: req.file.path
        })
        film
            .save()
            .then(result => {
                console.log(result);
                res.status(201).json({
                    message: "Film basarıyla olusturuldu.",
                    ceratedFilm: {
                        name: result.name,
                        type: result.type,
                        _id: result._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/films/' + result._id
                        }
                    }
                })
            })
            .catch(err => console.log(err))
    })

router.get('/:filmId', checkAuth, (req, res) => {
    const id = req.params.filmId;
    Film.findById(id)
        //.select("name price _id productImage")
        .exec()
        .then(doc => {
            console.log("From database", doc)
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/films'
                    }
                })
            } else {
                res.status(404).json({ message: "Girilen ID icin gecerli giris yok!!" })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err })
        })
})

router.patch('/:filmId', checkAuth, (req, res) => {
    const id = req.params.filmId
    const updateOps = {}
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Film.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {

            res.status(200).json({
                message: "Film Guncellendi",
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/films' + id
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:filmId', checkAuth, (req, res) => {
    const id = req.params.filmId
    Film.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Film Silindi!",
                request: {
                    type: 'POST',
                    url: "http://localhost:3000/films",
                    body: { name: 'String', type: 'String' }
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router