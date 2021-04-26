import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Test from './components/Test';
import FrontPage from './components/FrontPage/FrontPage';
import AreaChoice from './components/AreaChoicePage/AreaChoice';
import ExerciseTypes from './components/ExerciseTypes/ExerciseTypes';

function App() {
	return (
		<Router>
			<Switch>
				<Route exact path='/'>
					<FrontPage className=''/>
				</Route>
				<Route exact path='/areaChoice/UpperBody' >
					<ExerciseTypes id='upper' />
				</Route>
				<Route exact path='/areaChoice/LowerBody'>
					<ExerciseTypes id='lower'/>
				</Route><Route exact path='/areaChoice/LowerBody'>
					<ExerciseTypes id='whole'/>
				</Route>
				<Route exact path='/areaChoice' component={AreaChoice} />
				<Route exact path='/areaChoice/test' component={Test} />
			</Switch>
		</Router>
	);
}

export default App;
