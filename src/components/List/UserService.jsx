import { initializeApp } from 'firebase/app';
import {  
    getFirestore,
    collection,
    // addDoc,
    // doc,
    // deleteDoc,
    getDocs, 
} from 'firebase/firestore';


const firebaseApp = initializeApp({
    apiKey: "AIzaSyD5kiptu1dn4Zz6Psg_ak9iqDGtVDNZmN0",
    authDomain: "crud-react-26c29.firebaseapp.com",
    projectId: "crud-react-26c29",
});

// const [name, setName] = useState("");
// const [email, setEmail] = useState("");
// const [users, setUsers] = useState([]);

const db = getFirestore(firebaseApp);
const usersCollectionRef = collection(db, "users");

export const UserService = {

  async getUsersData() {
    const users = [];
    const getUsers = async () => {
        const data = await getDocs(usersCollectionRef);
        users.push(... (data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))));
        //data.docs.map((doc) => (users.push({ ...doc.data(), id: doc.id })));
        //data.docs.map((doc) => console.log(({ ...doc.data(), id: doc.id })))
      };
      return getUsers();
    //   getUsers().then(() => {
    //     //console.log(users);
    //     return users
    //     });
      //return users;
    //   return [
    //     {
    //         id: 1,
    //         name: 'Paulo 1',
    //         cpf: '12312312313',
    //         phone: '123123123123',
    //         gender: 'Male',
    //         cep: '123123123',
    //         address: 'Rua teste',
    //         city: 'Teste 1',
    //         neighborhood: 'Teste 2',   
    //         state: 'Teste 3',         
    //         number: '123',
    //     },
    //     {
    //         id: 2,
    //         name: 'Paulo 2',
    //         cpf: '12312312313',
    //         phone: '123123123123',
    //         gender: 'Male',
    //         cep: '123123123',
    //         address: 'Rua teste',
    //         city: 'Teste 1',
    //         neighborhood: 'Teste 2',   
    //         state: 'Teste 3',         
    //         number: '123',
    //     },
    //     {
    //         id: 3,
    //         name: 'Paulo 3',
    //         cpf: '12312312313',
    //         phone: '123123123123',
    //         gender: 'Male',
    //         cep: '123123123',
    //         address: 'Rua teste',
    //         city: 'Teste 1',
    //         neighborhood: 'Teste 2',   
    //         state: 'Teste 3',         
    //         number: '123',
    //     },
    //     {
    //         id: 4,
    //         name: 'Paulo 4',
    //         cpf: '12312312313',
    //         phone: '123123123123',
    //         gender: 'Male',
    //         cep: '123123123',
    //         address: 'Rua teste',
    //         city: 'Teste 1',
    //         neighborhood: 'Teste 2',   
    //         state: 'Teste 3',         
    //         number: '123',
    //     },
    //     {
    //         id: 5,
    //         name: 'Paulo 5',
    //         cpf: '12312312313',
    //         phone: '123123123123',
    //         gender: 'Male',
    //         cep: '123123123',
    //         address: 'Rua teste',
    //         city: 'Teste 1',
    //         neighborhood: 'Teste 2',   
    //         state: 'Teste 3',         
    //         number: '123',
    //     },
    //   ];
  },

  getUsersMini() {
      return Promise.resolve(this.getUsersData().slice(0, 5));
  },

  getUsersSmall() {
      return Promise.resolve(this.getUsersData().slice(0, 10));
  },

  getUsers() {
      return Promise.resolve(this.getUsersData());
      //return this.getUsersData();
  },
};

