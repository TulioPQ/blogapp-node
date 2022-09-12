const express = require("express");
const router = express.Router();
const mongoose = require('mongoose')
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const { eAdmin } = require("../helpers/eAdmin")


router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})
router.get('/posts', eAdmin,  (req, res) => {
    res.send("Pagina de posts")
})
router.get('/categorias', eAdmin,  (req, res) => {
    Categoria.find().sort({ date: "desc" }).then((categorias) => {
        res.render("admin/categorias", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})
router.get('/categorias/add', eAdmin,  (req, res) => {
    res.render("admin/addcategorias")
})
router.post("/categorias/nova", eAdmin,  (req, res) => {

    const name = req.body.nome;
    const slug = req.body.slug;

    var erros = [];



    if (!name || typeof name === undefined || name === null) {
        erros.push({
            text: "invalid name"
        })
    }

    if (!slug || typeof slug === undefined || slug === null) {
        erros.push({
            text: "invalid slug"
        })
    }

    if (name.length < 2) {
        erros.push({
            text: "name too short"
        })
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: name,
            slug: slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
        })
    }
})
router.get("/categorias/edit/:id", eAdmin,  (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render("admin/editcategorias", { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})
router.post("/categorias/edit", eAdmin,  (req, res) => {
    const name = req.body.nome;
    const slug = req.body.slug;
    const id = req.body.id;

    var erros = [];



    if (!name || typeof name === undefined || name === null) {
        erros.push({
            text: "invalid name"
        })
    }

    if (!slug || typeof slug === undefined || slug === null) {
        erros.push({
            text: "invalid slug"
        })
    }

    if (name.length < 2) {
        erros.push({
            text: "name too short"
        })
    }

    if (erros.length > 0) {
        res.render(`admin/editcategorias/${id}`, { erros: erros })
    } else {

        Categoria.findOne({ _id: id }).then(categoria => {
            categoria.nome = name;
            categoria.slug = slug;
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch(() => {
                req.flash("error_msg", "Houve um erro ao salvar a edição da categoria")
                res.redirect("/admin/categorias")
            })

        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao editar a categoria")
            res.redirect("/admin/categorias")
        })


    }
})
router.post("/categorias/deletar", eAdmin,  (req, res) => {
    Categoria.remove({
        _id: req.body.id
    }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})
router.get("/postagens", eAdmin,  (req, res) => {
    Postagem.find().populate("categoria").sort({ date: "desc" }).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})
router.get("/postagens/add", eAdmin,  (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagem", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
})
router.post("/postagens/nova", eAdmin,  (req, res) => {
    const titulo = req.body.titulo;
    const slug = req.body.slug;
    const descrisao = req.body.descrisao;
    const conteudo = req.body.conteudo;
    const cat = req.body.categoria;

    var erros = [];



    if (!titulo || typeof titulo === undefined || titulo === null) {
        erros.push({
            text: "invalid title"
        })
    }

    if (titulo.length < 3) {
        erros.push({
            text: "name too short"
        })
    }
    if (!slug || typeof slug === undefined || slug === null) {
        erros.push({
            text: "invalid slug"
        })
    }

    if (slug.length < 2) {
        erros.push({
            text: "slug too short"
        })
    }



    if (!descrisao || typeof descrisao === undefined || descrisao === null) {
        erros.push({
            text: "invalid description"
        })
    }

    if (descrisao.length < 9) {
        erros.push({
            text: "description must be longer than 10 characters"
        })
    }



    if (!conteudo || typeof conteudo === undefined || conteudo === null) {
        erros.push({
            text: "invalid content"
        })
    }

    if (conteudo.length < 9) {
        erros.push({
            text: "content must be longer than 20 characters"
        })
    }

    if (cat === "0") {
        erros.push({
            text: "Categoria inválida"
        })
    }

    if (erros.length > 0) {
        res.render("admin/postagens/add", { erros: erros })
    } else {
        const novaPostagem = {
            titulo: titulo,
            slug: slug,
            descrisao: descrisao,
            conteudo: conteudo,
            categoria: cat
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a postagem, tente novamente!")
            res.redirect("/admin/postagens")
        })
    }
})
router.get("/postagens/edit/:id", eAdmin,  (req, res) => {
    Postagem.findOne({ _id: req.params.id }).populate("categoria").then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editpostagem", { postagem: postagem, categorias: categorias },)
        }).catch((err) => {
            req.flash("error_msg", "Erro ao carregar as categorias")
            res.redirect("/admin/postagem")
        })
    }).catch((err) => {
        req.flash("error_msg", "Esta postagem não existe")
        res.redirect("/admin/postagem")
    })
})
router.post("/postagens/edit", eAdmin,  (req, res) => {
    const titulo = req.body.titulo;
    const slug = req.body.slug;
    const descrisao = req.body.descrisao;
    const conteudo = req.body.conteudo;
    const cat = req.body.categoria;
    const id = req.body.id;

    var erros = [];



    if (!titulo || typeof titulo === undefined || titulo === null) {
        erros.push({
            text: "invalid title"
        })
    }

    if (titulo.length < 3) {
        erros.push({
            text: "name too short"
        })
    }
    if (!slug || typeof slug === undefined || slug === null) {
        erros.push({
            text: "invalid slug"
        })
    }

    if (slug.length < 2) {
        erros.push({
            text: "slug too short"
        })
    }



    if (!descrisao || typeof descrisao === undefined || descrisao === null) {
        erros.push({
            text: "invalid description"
        })
    }

    if (descrisao.length < 9) {
        erros.push({
            text: "description must be longer than 10 characters"
        })
    }



    if (!conteudo || typeof conteudo === undefined || conteudo === null) {
        erros.push({
            text: "invalid content"
        })
    }

    if (conteudo.length < 9) {
        erros.push({
            text: "content must be longer than 20 characters"
        })
    }

    if (cat === "0") {
        erros.push({
            text: "Categoria inválida"
        })
    }

    if (erros.length > 0) {
        res.render("admin/postagens/add", { erros: erros })
    } else {
        Postagem.findOne({ _id: id }).then(postagem => {
            postagem.titulo = titulo;
            postagem.slug = slug;
            postagem.descrisao = descrisao;
            postagem.conteudo = conteudo;
            postagem.categoria = cat;


            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso!")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar a edição da postagem")
                res.redirect("/admin/postagens")
            })

        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao editar a postagens")
            res.redirect("/admin/postagens")
        })
    }
})
router.post("/postagens/deletar", eAdmin,  (req, res) => {
    Postagem.remove({
        _id: req.body.id
    }).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem")
        res.redirect("/admin/postagens")
    })
})


module.exports = router;