import Routes from './Routes';
import views from './views';
import auth from './auth';


export default (dreija, env) => {
    dreija
        .routes(Routes)
        .views(views)
        .auth(auth)
        .dbname('joenoodles')
        .dbhost(`${env.DBHOSTNAME}`)
        .redishost(`${env.REDISHOST}`);
};
