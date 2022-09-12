const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs");
const { route } = require("./admin");
const passport = require("passport")

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        erros.push({ text: "Nome invalido" })
    }

    if (!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        erros.push({ text: "Email invalido" })
    }

    if (!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        erros.push({ text: "Nome invalido" })
    }

    if (req.body.senha.length < 4) {
        erros.push({ text: "Senha muito curta" })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ text: "Senhas diferentes" })
    }


    if (erros.length > 0) {
        res.render("usuarios/registro", { erros: erros })
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe um cadastro com este email no nosso sistema")
                res.redirect("/usuarios/registro")

            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/usuarios/registro")
                        }

                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/usuarios/registro")
                        })

                    })
                })
            }

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }


})

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.delete('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out')
        } else {
          res.send('Logout successful')
        }
      });
    } else {
      res.end()
    }
  })



// router.get("/logout",(req, res) => {
//     req.logOut()
//     req.flash("success_msg", "Deslogado com sucesso!")
//     res.redirect('/')
// })

router.post("/logout",(req, res,next) => {
    req.logOut((err) => { 
        if (err) { return next(err); }
     })
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect('/')
})



module.exports = router