import React, { Component } from 'react'
import TodoList from './TodoList'
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from './config'
import Web3 from 'web3'
import './App.css'

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            taskCount: 0,
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
        this.state.todoList.methods.createTask(content).send({ from: this.state.account })
            .once('receipt', (receipt) => {
                this.setState({ loading: false })
                this.loadTasks()
            })
    }

    toggleCompleted(taskId) {
        this.setState({ loading: true })
        this.state.todoList.methods.toggleCompleted(taskId).send({ from: this.state.account })
            .then((receipt) => {
                this.setState({ loading: false })
                this.loadTasks()
            })
    }
    async loadBlockchainData() {
        const web3 = new Web3(Web3.givenProvider || "http://localhost:7545")
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })
        const options = {
            transactionConfirmationBlocks: 1
        };
        const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS, options)
        this.setState({ todoList })
        this.loadTasks()
    }

    async loadTasks() {
        const { todoList } = this.state
        this.setState({ tasks: [] })
        const taskCount = await todoList.methods.taskCount().call()
        this.setState({ taskCount, loading: false })
        for (var i = 1; i <= taskCount; i++) {
            const task = await todoList.methods.tasks(i).call()
            this.setState({
                tasks: [...this.state.tasks, task]
            })
        }
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