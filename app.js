// Carregando modulos

const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
// const mongoose = require("mongoose");
const admin = require('./routes/admin')
const path = require('path');
const { default: mongoose } = require("mongoose");
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require('./routes/usuarios')
const passport = require("passport")
require("./config/auth")(passport)
const {mongoURI} = require("./config/db")



//Configurações
// Sessão
app.use(session({
    secret: "qualquerCoisa",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
// middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error")
    res.locals.user= req.user || null;
    next();
})
//bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}))
app.set('view engine', 'handlebars');
// Mongoose
mongoose.Promise = global.Promise;
const mongodbPORT = "27017"
mongoose.connect(mongoURI(mongodbPORT)).then(() => {
    console.log("Conectado ao mongoDB");
}).catch((err) => {
    console.log("Erro ao conectar ao mongoDB:\n", err);
    console.log(mongoURI)
})

//Public

app.use(express.static(path.join(__dirname, "public")));
// app.use((req, res, next  ) => { 
//     console.log("oi eu sou um middleware")
//     next()
// })
//Rotas

app.get("/", (req, res) => {
    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {

        res.render("index", { postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })

})

app.get("/404", (req, res) => {
    res.send("Erro 404!")
})

app.get("/categorias", (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("categorias/index", { categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar categorias")
        res.redirect("/")
    })
})


app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens) => { 
                res.render("categorias/postagens", {categoria: categoria, postagens: postagens})
             }).catch((err) => { 
                req.flash("error_msg", "Houve um erro ao listar os posts")
                res.redirect("/")
              })
        }else{
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar categorias")
        res.redirect("/")
    })
})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
        if (postagem) {
            res.render("postagem/index", { postagem })
        } else {
            req.flash("error_msg", "Esta postagem não exite")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })

})




app.use('/admin', admin)
app.use("/usuarios",usuarios )

//outros

const PORT =  process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log("Server is running...\n");
    console.log(`http://localhost:${PORT}`)
})