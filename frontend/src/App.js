import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Test from './components/Test';
import FrontPage from './components/FrontPage/FrontPage';
import AreaChoice from './components/AreaChoicePage/AreaChoice';
import ExerciseAreaTypes from './components/ExerciseAreaTypes/ExerciseAreaTypes';
import Header from './components/Header/Header';
import ExerciseTypes from './components/ExerciseTypes/ExerciseTypes';
import Profile from './components/Profile/Profile';

function App() {
	return (
		<Router>
			<Header/>
				<Switch>
					<Route exact path='/'>
						<FrontPage className=''/>
					</Route>
					<Route exact path='/areaChoice/UpperBody' >
						<ExerciseAreaTypes id='upper' />
					</Route>
					<Route exact path='/areaChoice/LowerBody'>
						<ExerciseAreaTypes id='lower'/>
					</Route>
					<Route exact path='/areaChoice/FullBody'>
						<ExerciseAreaTypes id='full'/>
					</Route>

					<Route exact path='/areaChoice/UpperBody/Chest' >
						<ExerciseTypes id='chest' />
					</Route>
					<Route exact path='/areaChoice/LowerBody/Legs'>
						<ExerciseTypes id='legs'/>
					</Route>
					<Route exact path='/areaChoice/FullBody/Booty'>
						<ExerciseTypes id='booty'/>
					</Route>

					<Route exact path='/areaChoice' component={AreaChoice} />
					<Route exact path='/areaChoice/test' component={Test} />
				<Route exact path='/profile'>
					<Profile className='mx-3' />
				</Route>
				</Switch>
		</Router>
	);
}

export default App;
