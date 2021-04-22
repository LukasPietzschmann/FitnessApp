import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Test from './components/Test';
import FrontPage from './components/FrontPage/FrontPage';

function App() {
	return (
		<Router>
			<Switch>
				<Route exact path='/'>
					<FrontPage className=''/>
				</Route>
				<Route exact path='/test' component={Test} />
			</Switch>
		</Router>
	);
}

export default App;
