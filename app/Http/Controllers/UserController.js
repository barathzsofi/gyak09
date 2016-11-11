'use strict'

const Hash = use('Hash')
const User = use('App/Model/User')
const Validator = use('Validator')
const Helpers = use('Helpers')

class UserController {

    * login(request,response){
        yield response.sendView('login');
    }

    * register(request,response){
        if(request.currentUser){
            yield response.route('main');
        }
        yield response.sendView('register');
    }

    * doLogin(request,response){
        yield response.sendView('login');
    }

    * doRegister(request,response){
        const userData = request.all()
        const validation = yield Validator.validateAll(userData, {
            username: 'required|unique:users',
            nickname: 'required|max:50',
            email: 'required|email|unique:users',
            password: 'required',
            password_again: 'required|same:password'
        })

        if (validation.fails()) {
            yield request
                .withOut('password','password_again')
                .andWith({ errors: validation.messages() })
                .flash()

            response.route('register')
            return;
        }

        const user = new User();
        user.username = userData.username
        user.nickname = userData.nickname 
        user.email = userData.email
        user.password = yield Hash.make(userData.password)

        yield user.save()

        yield request.auth.login(user)

        yield response.route('main');
    }

}

module.exports = UserController
