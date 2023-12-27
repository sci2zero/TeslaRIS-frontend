<template>
    <div id="login-page">
        <div class="login-wrapper">
            <h2 class="login-title">
                Login
            </h2>
            <form action="">
                <label class="email-field" for="email">Email</label>
                <input name="email" type="text">
                <label class="password-field" for="password">Password</label>
                <input name="password" type="password">
                <a href="#" class="forgot-password-link">I forgot password</a>


                <input class="login-submit" type="button" value="Login">
                <a href="#" class="register-link">Register</a>
            </form>
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style>
    #login-page {
        width: 100%;

        .login-wrapper {
            width: 100%;
            max-width: 500px;
            float: right;
            padding: 2em;
            background: #f8f8f8;
            border-radius: 1em;
            box-shadow: 0 0 35px #36363630;
        }

        .login-title {
            margin-bottom: 1em;
            font-weight: bold;
            font-size: 1.6em;
            color: #444444;
        }

        input{
            margin-bottom: 1em;
        }

        .login-submit {
            display: block;
            margin-top: 1em;
            padding: 1em 2em;
            background: #5f8ae6;
            width: 100%;
            border-radius: 0.3em;
            color: #fff;
            font-weight: 700;
        }

        .forgot-password-link {
            text-align: right;
            display: block;
        }

        .register-link {
            display: block;
            text-align: center;
        }
    }

</style>