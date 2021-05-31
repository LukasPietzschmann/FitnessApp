import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Test from './components/Test';
import FrontPage from './components/FrontPage/FrontPage';
import AreaChoice from './components/AreaChoicePage/AreaChoice';
import ExerciseAreaTypes from './components/ExerciseAreaTypes/ExerciseAreaTypes';
import Header from './components/Header/Header';
import Profile from './components/Profile/Profile';
import Login from './components/Profile/Login';
import Register from './components/Profile/Register';
import AllGroups from './components/AllGroups/AllGroups';
import Group from './components/SingleGroup/Group';
import GroupInvitation from './components/SingleGroup/GroupInvitation';
import NotFound from './components/NotFound';
import useUser from './hooks/useUser';
import Plan from './components/Plan/Plan';
import TestWS from './components/TestWS';

function App() {
	const [token, uid, logout] = useUser();

	if (!(token && uid))
		return (
			<Router>
				<Switch>
					<Route exact path={['/', '/login']}>
						<Login className='mx-auto mt-5' style={{ width: 'clamp(400px, 35vw, 1000px)' }} />
					</Route>
					<Route exact path='/register'>
						<Register className='mx-auto mt-5' style={{ width: 'clamp(400px, 35vw, 1000px)' }} />
					</Route>
					<Route component={NotFound}/>
				</Switch>
			</Router>
		);
	return (
		<Router>
			<Header />
			<Switch>
				<Route exact path='/'>
					<FrontPage className='' />
				</Route>
				<Route exact path='/test' component={TestWS}/>
				<Route exact path='/groups' component={AllGroups} />
				<Route exact path='/groups/:group_id' component={Group} />
				<Route exact path='/groups/:group_id/join' component={GroupInvitation} />
				<Route exact path='/area' component={AreaChoice} />
				<Route exact path='/area/:area_id' component={ExerciseAreaTypes} />
				<Route exact path='/plan' component={Plan} />
				<Route exact path='/profile'>
					<Profile className='mx-3' />
				</Route>
				<Route exact path='/login'>
					<Login className='mx-auto mt-5' style={{ width: 'clamp(400px, 35vw, 1000px)' }} />
				</Route>
				<Route exact path='/register'>
					<Register className='mx-auto mt-5' style={{ width: 'clamp(400px, 35vw, 1000px)' }} />
				</Route>
				<Route component={NotFound} />
			</Switch>
		</Router>
	);
}

export default App;
