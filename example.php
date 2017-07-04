<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Facebook MoLo</title>
</head>
<body>

<div>
    <a href="#" id="fblogin" style="display:block;width:200px;font-size:20px;background:#4F5E97;color:#FFF;padding:10px;text-align: center;border-radius: 4px">FB LOGIN</a>
    <div id="fbconnected" style="display:none;width:200px;font-size:20px;background:#45AF66;color:#FFF;padding:10px;text-align: center;border-radius: 4px">FB CONNECTED</div>
    <p>Find the auth response in the console</p>
</div>

<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<script src="assets/vendor/facebook-molo.min.js?v=<?= time() ?>"></script>
<script src="facebook-friends-graph.min.js?v=<?= time() ?>"></script>

<script>
    window.fbAsyncInit = function () {
        var appId = '946621778709815';
        var scope = 'public_profile,user_posts,user_photos';

        FB.init({
            appId: appId,
            xfbml: true,
            version: 'v2.9'
        });

        var fbMolo = new FacebookMoLo(FB, appId, scope, true);

        var authCallback = function (response) {
            console.log('AUTH CALLBACK', response);

            if (response.status === 'connected') {
                $('#fblogin').hide();
                $('#fbconnected').css('display', 'block');

                new FacebookFriends(FB, response.authResponse.userID).build(function (graph) {
                    var total = graph.length;
                    console.log('total graph items:', total);
                    console.log('top 50 items:', graph.slice(0, 50));
                });
            }
        };

        if (fbMolo.isSuccessfulCallback()) {
            fbMolo.authenticate(authCallback);
        }

        $('#fblogin').click(function (e) {
            e.preventDefault();
            fbMolo.authenticate(authCallback);
        });
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
</script>

</body>
</html>