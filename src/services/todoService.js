import Web3 from 'web3'

const TodoService = {
    getContractInstance: (abi, address, web3) => {
        const options = {
            transactionConfirmationBlocks: 1
        };
        const instance = new web3.eth.Contract(abi, address, options)
        return instance
    },

    getNetwork: web3 => {
        return web3.eth.net.getId();
    },

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

    create: (instance, content, account) => {
        return instance.methods.createTask(content).send({ from: account })
    },

    toggleComplete: (instance, taskId, account) => {
        return instance.methods.toggleCompleted(taskId).send({ from: account })
    }
}

export default TodoService;