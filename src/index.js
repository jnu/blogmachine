import Routes from './Routes';
import views from './views';
import auth from './auth';


export default (dreija, env) => {
    dreija
        .title(`Joe Nudell`)
        .routes(Routes)
        .views(views)
        .auth(auth)
        .dbname('joenoodles')
        .dbhost(env.DBHOST)
        .redishost(env.REDISHOST);
};
