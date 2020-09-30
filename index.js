var crypto = require('crypto');
var uuid = require('uuid');
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
const multer = require('multer');
var path = require('path')
//connect mysql
var con = mysql.createConnection({
    host: 'localhost',//Replace your  host ip
    user: "root",
    password: "",
    database: "android"
});
// Password ULTIL
var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    // convert to hex format
    // return required number of charactere
};
var Sha512 = function (password, salt) {
    var hash = crypto.createHmac('Sha512', salt)//user Sha512 encrypting
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };

};
function saltHashPassword(userPassword) {
    var salt = genRandomString(16);//generate  random string with 16 charactere to salt
    var passwordData = Sha512(userPassword, salt);
    return passwordData;
}
function checkHashPassword(userPassword, salt) {
    var passwordData = Sha512(userPassword, salt);
    return passwordData;

}
var app = express();
app.use(bodyParser.json());//accept json Params
app.use(bodyParser.urlencoded({ extended: true }));//accept url  Encoded Paramatre
//Debut Partie User
//post register
app.post('/register/', (req, res, next) => {
    var post_data = req.body;//get Post Params
    var uid = uuid.v4();//get uuid  v4 like '112kjlksjlks, 120qds,9002,vcqdqd'
    var plaint_password = post_data.password;//get password from body
    var hash_data = saltHashPassword(plaint_password);
    var password = hash_data.passwordHash; //get hash value
    var salt = hash_data.salt;//Get salt

    var name = post_data.name;
    var email = post_data.email;


    con.query('SELECT * FROM user where email=?', [email], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {
            res.json('User already exists !!!');
        }
        else {
            con.query(' INSERT INTO `user`(`u_id`, `name`, `email`, `encrypted_password`, `salt`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,NOW(),NOW())', [uid, name, email, password, salt], function (err, result, fields) {
                con.on('error', function (err) {
                    console.log('[MYSQL ERROR]', err);
                    res.json('Register error :', err);
                });
                res.json('Register Successful');


            })
        }


    })
})
//post login
app.post('/login/', (req, res, next) => {
    var post_data = req.body;
    //extarct email , password from request
    var user_password = post_data.password;
    var email = post_data.email;
    con.query('SELECT * FROM user where email=?', [email], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {
            var salt = result[0].salt; //get salt if account exist
            var encrypted_password = result[0].encrypted_password;// get   encrypted password;
            var hashed_password = checkHashPassword(user_password, salt).passwordHash;
            if (encrypted_password == hashed_password) {
                res.status(201).end(JSON.stringify(result[0]))//if password is true return all info of user
                //res.json(result[0]);
            }
            else {
                // res.end(JSON.stringify('Wrong Password'))
                /*     res.status(400).json({
                         //  user: JSON.stringify(result[0]),
     
                         msgerror: "Wrong Password"
                     })*/
                res.json({

                    msgerror: "Wrong Password",
                    name: "Error  1 "

                });
            }

        }
        else {
            //res.json('User not exists !!!');
            res.json({
                msgerror: "User not exists",
                name: "Error  1 "

            });

        }
    })
})
//
app.post('/afficherparemail/', (req, res, next) => {
    var post_data = req.body;
    var email = post_data.email
    //var email = post_data.email;

    con.query('SELECT * FROM user WHERE email=? ', [email], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {

            res.status(200).end(JSON.stringify(result[0]))//if password is true return all info of user
            //res.json(result);



        }
        else {
            res.json('User not exists !!!');
        }
    })
})
//
app.get('/afficher/', (req, res, next) => {
    var post_data = req.body;
    //var email = post_data.email;

    con.query('SELECT * FROM user ', function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {

            res.status(200).end(JSON.stringify(result))//if password is true return all info of user
            //res.json(result);



        }
        else {
            res.json('User not exists !!!');
        }
    })
})
//
app.post('/update/', (req, res, next) => {
    var post_data = req.body;//get Post Params
    var name = post_data.name;
    var email = post_data.email;
    var telephone = post_data.telephone;
    var addresse = post_data.addresse;
    var image = post_data.image;

    var id = post_data.id;



    con.query(' UPDATE`user` SET `name` =?, `email` = ?,`image`=?,`telephone`= ?,`addresse`= ?, `updated_at` = NOW() WHERE id=?', [name, email, image, telephone, addresse, id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
            res.json('update error :', err);
        });
        res.json('update succeful :');
    })
})
//
app.delete('/delete/', (req, res, next) => {
    var post_data = req.body;//get Post Params
    var u_id = post_data.u_id;
    con.query('DELETE FROM `user` WHERE u_id=?', [u_id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
            res.json('delete error :', err);
        });
        res.json('delete succeful!');
    })
})
//FinPartie user
//Debut Partie Produit
app.post('/RegisterProduit/', (req, res, next) => {
    var post_data = req.body;//get Post Params

    var image = post_data.image;
    var name = post_data.name;
    var description = post_data.description;
    var prixdebut = post_data.prixdebut;
    var user_id = post_data.user_id;


    con.query('INSERT INTO `produit` (`image`, `name`, `description`, `prixdebut`, `user_id`) VALUES(?,?,?,?,?)', [image, name, description, prixdebut, user_id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
            res.json('Register error :', err);
        });
        res.json('Register Successful');

    })

})
//
app.post('/afficherallProduit/', (req, res, next) => {
    var post_data = req.body;
    var user_id = post_data.user_id;
    con.query('SELECT * FROM produit where user_id = ? ', [user_id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {
            res.end(JSON.stringify(result))//if password is true return all info of user

        }
        else {
            res.json('User not exists !!!');
        }
    })
})
//
app.post('/getoneproduit/', (req, res, next) => {
    var post_data = req.body;
    var id = post_data.id;
    con.query('SELECT * FROM produit where id = ? ', [id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {

            res.status(200).end(JSON.stringify(result[0]))//if password is true return all info of user
            //res.json(result);



        }
        else {
            res.json('User not exists !!!');
        }
    })
})
//
app.get('/afficheralllProduit/', (req, res, next) => {
    var post_data = req.body;
    con.query('SELECT * FROM produit Where encour = 1', function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {
            res.end(JSON.stringify(result))//if password is true return all info of user

        }
        else {
            res.json('User not exists !!!');
        }
    })
})
//
app.post('/deleteProduit/', (req, res, next) => {
    var id = req.body.id;
    con.query('DELETE FROM `produit` WHERE id=?', [id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
            res.json('delete error :', err);
        });
        res.json('delete succeful!');
    })
})
//
app.post('/updateProduit/', (req, res, next) => {
    var post_data = req.body;//get Post Params
    var image = post_data.image;
    var name = post_data.name;
    var description = post_data.description;
    var prixdebut = post_data.prixdebut;
    var id = post_data.id;

    con.query('UPDATE`produit` SET `image` = ?, `name` = ?, `description` = ?, `prixdebut` = ? WHERE `id`=?', [image, name, description, prixdebut, id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
            res.json('update error :', err);
        });
        res.json('update succeful :');
    })
})
//
app.post('/updatencour/', (req, res, next) => {
    var post_data = req.body;//get Post Params
    var encour = post_data.encour;
    var id = post_data.id;

    con.query('UPDATE`produit` SET `encour` = ? ,`tobid_at`= NOW() WHERE `id`=?', [encour, id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
            res.json('update error :', err);
        });
        res.json('update succeful :');
    })
})
//
app.post('/Selectlastbid/', (req, res, next) => {
    var post_data = req.body;//get Post Params
    var id_produit = post_data.id_produit;

    con.query('SELECT * FROM `enchere` WHERE `id_produit` = ?', [id_produit], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
            res.json('update error :', err);
        });
        res.json('update succeful :');
    })
})
//
//finproduit
//debutenchere
app.post('/ajouteraubid/', (req, res, next) => {
    var post_data = req.body;//get Post Params

    var id_user_achete = post_data.id_user_achete;
    var id_produit = post_data.id_produit;
    var cost = post_data.cost;

    con.query('INSERT INTO `enchere`(`id_user_achete`, `id_produit`, `cost`) VALUES (?,?,?)', [id_user_achete, id_produit, cost], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
            res.json('ajouter au bid error :', err);
        });
        res.json('ajout au bid succefull');

    })

})
//
app.post('/bid/', (req, res, next) => {
    var post_data = req.body;//get Post Params
    var cost = post_data.cost;
    var id_produit = post_data.id_produit;
    var id_user_achete = post_data.id_user_achete;

    con.query('UPDATE `enchere` SET `id_user_achete`= ?, `cost`= ?  WHERE `id_produit` = ?', [id_user_achete, cost, id_produit], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
            res.json('update error :', err);
        });
        res.json('update succeful!! ');
    })
})
//
app.post('/getoneenchere/', (req, res, next) => {
    var post_data = req.body;
    var id = post_data.id;
    con.query('SELECT * FROM `enchere` WHERE `id` = ? ', [id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {

            res.status(200).end(JSON.stringify(result[0]))//if password is true return all info of user
            //res.json(result);



        }
        else {
            res.json('User not exists !!!');
        }
    })
})
//
app.post('/getalleenchere/', (req, res, next) => {
    var post_data = req.body;
    var id = post_data.id;
    con.query('SELECT * FROM `enchere` ', [id], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {

            res.status(200).end(JSON.stringify(result[0]))//if password is true return all info of user
            //res.json(result);



        }
        else {
            res.json('User not exists !!!');
        }
    })
})
//
//fin enchere
///upload image 
var fs = require('fs');
storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        return crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) {
                return cb(err);
            }
            return cb(null, "" + (raw.toString('hex')) + (path.extname(file.originalname)));
        });
    }
});
// Post files
app.post(
    "/upload/",
    multer({
        storage: storage
    }).single('image'), function (req, res) {
        console.log(req.file);
        console.log(req.body);
        //  res.redirect("/uploads/" + req.file.filename);
        //  console.log(req.file.filename);
        return res.json({
            image: req.file.filename
        })
    });

app.get('/uploads/:image', function (req, res) {
    file = req.params.image;
    console.log(req.params.image);
    var img = fs.readFileSync(__dirname + "/uploads/" + file);
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(img, 'binary');

});
///finupload image
//Strat Server
app.listen(3000, () => {
    console.log('Restfull android Run on port 3000');
})