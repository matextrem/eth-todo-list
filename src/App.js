import React, { Component } from 'react'
import Web3 from 'web3'
import TodoList from './TodoList'
import { TODO_LIST_ADDRESS } from './config'
import TODO_CONTRACT from './build/TodoList.json'
import TodoService from './services/todoService'
import './App.css'

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            taskCount: 0,
            networkId: 0,
            tasks: [],
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
    async loadBlockchainData() {
        const accountData = await TodoService.getAccount();
        this.setState({ account: accountData.account })
        TodoService.getNetwork(accountData.provider).then((res) => {
            console.log(res);
        })
        const todoList = TodoService.getContractInstance(TODO_CONTRACT.abi, TODO_LIST_ADDRESS, accountData.provider)
        this.setState({ todoList })
        this.loadTasks()
    }

    async loadTasks() {
        const { todoList } = this.state
        this.setState({ tasks: [], loading: false })
        const tasks = await TodoService.getData(todoList)
        this.setState({ tasks })

    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="http://www.dappuniversity.com/free-download" target="_blank">Dapp University | Todo List</a>
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
                                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                                : <TodoList tasks={this.state.tasks} toggleCompleted={this.toggleCompleted} createTask={this.createTask} />
                            }
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;