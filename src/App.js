import React, { Component } from 'react'
import TodoList from './TodoList'
import TODO_CONTRACT from './build/TodoList.json'
import TodoService from './services/todoService'
import './App.css'

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            taskCount: 0,
            isValidNetwork: true,
            provider: null,
            tasks: [],
            eventsLog: {
                TaskCreated: [],
                TaskCompleted: []
            },
            loading: true
        }
        this.createTask = this.createTask.bind(this)
        this.toggleCompleted = this.toggleCompleted.bind(this)
    }

    componentDidMount() {
        this.loadBlockchainData()
    }

    createTask(content) {
        this.setState({ loading: true })
        TodoService.create(this.state.todoList, content, this.state.account).once('receipt', (receipt) => {
            this.setState({ loading: false })
            this.loadTasks()
        })
    }

    toggleCompleted(taskId) {
        this.setState({ loading: true })
        TodoService.toggleComplete(this.state.todoList, taskId, this.state.account).then((receipt) => {
            this.setState({ loading: false })
            this.loadTasks()
        })
    }

    handler = async event => {
        this.state.provider.eth.getBlock(event.blockNumber, (error, block) => {
            let date = null;
            if (block) {
                const timestamp = block.timestamp;
                date = new Date(timestamp * 1000)
            }
            const eventsLog = Object.assign(
                {},
                this.state.eventsLog,
                { [event.event]: [...this.state.eventsLog[event.event], { ...event.returnValues, date },] }
            )
            this.setState({ eventsLog })
        });

    }

    errorCallback = err => {
        console.error(err);
    }
    async loadBlockchainData() {
        const accountData = await TodoService.getAccount();
        this.setState({ account: accountData.account, provider: accountData.provider })
        const networkId = await TodoService.getNetwork(accountData.provider)
        if (TodoService.isValidNetwork(networkId)) {
            const address = TODO_CONTRACT.networks[networkId].address
            const todoList = TodoService.getContractInstance(TODO_CONTRACT.abi, address, accountData.provider)
            TodoService.subscribeEvents(todoList, this.handler, this.errorCallback)
            this.setState({ todoList })
            this.loadTasks()
        } else this.setState({ isValidNetwork: false })

    }

    async loadTasks() {
        const { todoList } = this.state
        this.setState({ tasks: [], loading: false })
        const tasks = await TodoService.getData(todoList)
        this.setState({ tasks })

    }

    getLoadingData() {
        let loadingText = "Loading..."
        if (!this.state.isValidNetwork)
            loadingText = "Wrong network. Please, change it."
        return <p className="text-center">{loadingText}</p>
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="http://www.dappuniversity.com/free-download" target="_blank" rel="noopener noreferrer">Dapp University | Todo List</a>
                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                            <small><a className="nav-link" href="#"><span id="account"></span></a></small>
                        </li>
                    </ul>
                </nav>
                <div className="container-fluid">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex justify-content-center">
                            {this.state.loading
                                ? <div id="loader" className="text-center">{this.getLoadingData()}</div>
                                : <TodoList tasks={this.state.tasks} toggleCompleted={this.toggleCompleted} createTask={this.createTask} />
                            }
                        </main>
                    </div>
                    <div className="row">
                        <h3>Todo events log</h3>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;