import Web3 from 'web3'
import TODO_CONTRACT from '../build/TodoList.json'

const TodoService = {
    getContractInstance: (abi, address, web3) => {
        const options = {
            transactionConfirmationBlocks: 1
        };
        const instance = new web3.eth.Contract(abi, address, options)
        return instance
    },

    getNetwork: async web3 => {
        const network = await web3.eth.net.getId();
        return network
    },

    isValidNetwork: networkId => TODO_CONTRACT.networks.hasOwnProperty(networkId),

    getAccount: async () => {
        const web3 = new Web3(Web3.givenProvider || "http://localhost:7545")
        const accounts = await web3.eth.getAccounts()
        return { account: accounts[0], provider: web3 }
    },

    getData: async instance => {
        const data = []
        const taskCount = await instance.methods.taskCount().call()
        for (var i = 1; i <= taskCount; i++) {
            const task = await instance.methods.tasks(i).call()
            data.push(task)
        }
        return data
    },

    create: (instance, content, account) => instance.methods.createTask(content).send({ from: account }),

    toggleComplete: (instance, taskId, account) => instance.methods.toggleCompleted(taskId).send({ from: account })
}

export default TodoService;