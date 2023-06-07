import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { initializeApp } from 'firebase/app';
import {  
    getFirestore,
    collection,
    addDoc,
    doc,
    deleteDoc,
    updateDoc,
    getDocs, 
} from 'firebase/firestore';

const urlCep = 'https://viacep.com.br/ws/*/json';
const urlUf = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/";

const firebaseApp = initializeApp({
    apiKey: "AIzaSyD5kiptu1dn4Zz6Psg_ak9iqDGtVDNZmN0",
    authDomain: "crud-react-26c29.firebaseapp.com",
    projectId: "crud-react-26c29",
});

const db = getFirestore(firebaseApp);
const usersCollectionRef = collection(db, "users");

export function List() {
    let emptyUser = {
        id: null,
        name: '',
        cpf: '',
        phone: '',
        gender: '',
        cep: '',
        address: '',
        city: '',
        neighborhood: '',   
        state: '',         
        number: '',
    };

    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);

    const genderOptions = [
        { name: 'Masculino', code: 'Ma' },
        { name: 'Feminino', code: 'Fe' },
        { name: 'Outro', code: 'Ou' },
    ];


    const [users, setUsers] = useState(null);
    const [userDialog, setUserDialog] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [user, setUser] = useState(emptyUser);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [cepError, setCepError] = useState(false);
    const [state, setState] = useState([]);
    const [cities, setCities] = useState([]);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const getUsers = async () => {
            const data = await getDocs(usersCollectionRef);
            setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          };
          getUsers();

        fetch(urlUf).then((res) => {
            return res.json()
        }).then((data) => {
            let arr = [];
            data.forEach(element => arr.push({ name: element.nome, sigla: element.sigla, id: element.id }));
            arr.sort();
            setState(arr);
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buscaCep = (cep) => {

        let _user = { ...user };
        let cepFiltered = cep.replaceAll('_', '').replaceAll('-', '')

        if(cepFiltered.length == 8){
            let newUrl = urlCep.replace('*', cepFiltered);
            fetch(newUrl).then((res) => {
                return res.json()
            }).then((dados) => {
                if(dados.erro){
                    setCepError(true);
                    _user.address = '';
                    _user.neighborhood = '';
                    _user.cep = cep;
            
                    setUser(_user);
                } else {

                    _user.address = dados.logradouro;
                    _user.neighborhood = dados.bairro;
                    _user.cep = cep;
                    
                    setUser(_user);
                }
                
            })
        } else {
            setCepError(false);
            _user.address = '';
            _user.neighborhood = '';
            _user.cep = cep;
            
            setUser(_user);
        }
        
    }

    const openNew = () => {
        setUser(emptyUser);
        setSelectedGender(null);
        setSelectedState(null);
        setSelectedCity(null);

        setSubmitted(false);
        setUserDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const saveUser = async () => {
        setSubmitted(true);

        if (user.name.trim()) {
            let _users = [...users];
            let _user = { ...user };
            if (user.id) {
                const index = findIndexById(user.id);
                _user.state = selectedState.name;
                _user.city = selectedCity.name;
                _user.gender = selectedGender.name;

                const userDoc = doc(db, "users", user.id);

                let userUpdate = { ..._user };
                delete userUpdate.id;

                await updateDoc(userDoc, userUpdate).then(() => {
                    setUsers(_users);
                    setUserDialog(false);
                    setUser(emptyUser);
                });

                _users[index] = _user;
                toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Atualizado', life: 3000 });
            } else {
                _user.state = selectedState.name;
                _user.city = selectedCity.name;
                _user.gender = selectedGender.name;

                let userAdd = { ..._user };
                delete userAdd.id;

                await addDoc(usersCollectionRef, userAdd).then(res => {
                    _user.id = res._key.path.segments[1];
                    _users.push(_user);

                    setUsers(_users);
                    setUserDialog(false);
                    setUser(emptyUser);
                });
                
                toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Criado', life: 3000 });
            }
        }
    };

    const editUser = async (user) => {
        setUser({ ...user });
        let _gender = genderOptions.filter((val) => val.name == user.gender);
        let _state = state.filter((val) => val.name == user.state);
        await updateCities(_state[0].id).then((newCities) => {
            let _city = newCities.filter((val) => val.name == user.city);
            setSelectedCity(_city[0]);
        });

        setSelectedGender(_gender[0]);
        setSelectedState(_state[0]);
        setUserDialog(true);
    };

    const confirmDeleteUser = (user) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const deleteUser = async () => {
        let _users = users.filter((val) => val.id !== user.id);
        const userDoc = doc(db, "users", user.id);

        await deleteDoc(userDoc).then(() => {
            setUsers(_users);
            setDeleteUserDialog(false);
            setUser(emptyUser);
            toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Deletado', life: 3000 });
        })
    };

    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const updateCities = (stateId) => { 
        const url = urlUf + stateId + "/municipios";

        return new Promise((resolve, reject) => {
            fetch(url)
              .then((res) => res.json())
              .then((data) => {
                let arr = [];
                data.forEach(element => arr.push({ name: element.nome, sigla: element.sigla, id: element.id }));
                setCities(arr);
                resolve(arr);
              })
              .catch((error) => {
                reject(error);
              });
          });
    }

    const selectState = (e) => {
        setSelectedState(e.value);
        updateCities(e.value.id);
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _user = { ...user };

        _user[`${name}`] = val;
        if(name == 'cep') buscaCep(val);

        setUser(_user);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Novo" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editUser(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUser(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Lista de Usuários</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );
    const userDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" onClick={saveUser} />
        </React.Fragment>
    );
    const deleteUserDialogFooter = (
        <React.Fragment>
            <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteUserDialog} />
            <Button label="Sim" icon="pi pi-check" severity="danger" onClick={deleteUser} />
        </React.Fragment>
    );
    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={users} 
                        dataKey="id"  paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Exibindo {first} de {last} de {totalRecords} usuários" globalFilter={globalFilter} header={header}>
                    <Column field="name" header="Nome" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="cpf" header="CPF" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="phone" header="Telefone" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="gender" header="Gênero" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="cep" header="CEP" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="address" header="Endereço" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="city" header="Cidade" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="neighborhood" header="Bairro" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="state" header="Estado" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="number" header="Número" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={userDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Informações do Usuário" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                {/* linha 1 */}
                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        Nome
                    </label>
                    <InputText id="name" value={user.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !user.name })} />
                    {submitted && !user.name && <small className="p-error">Nome é obrigatório!</small>}
                </div>

                {/* linha 2 */}
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="cpf" className="font-bold">
                            CPF
                        </label>
                        {/* <InputText id="cpf" value={user.cpf} onChange={(e) => onInputChange(e, 'cpf')} required /> */}
                        <InputMask id="cpf" value={user.cpf} onChange={(e) => onInputChange(e, 'cpf')} mask="999.999.999-99" placeholder="999.999.999-99" />
                    </div>
                    <div className="field col">
                        <label htmlFor="phone" className="font-bold">
                            Telefone
                        </label>
                        {/* <InputText id="phone" value={user.phone} onChange={(e) => onInputChange(e, 'phone')} required /> */}
                        <InputMask id="phone" value={user.phone} onChange={(e) => onInputChange(e, 'phone')} mask="(99) 99999-9999" placeholder="(99) 99999-9999"/>
                    </div>
                    <div className="field col">
                        <label htmlFor="Gender" className="font-bold">
                            Gênero
                        </label>
                        <Dropdown value={selectedGender} onChange={(e) => setSelectedGender(e.value)} options={genderOptions} optionLabel="name" 
                        placeholder="Selecionar" className="font-bold" />
                    </div>
                </div>
                <br />

                {/* linha 3 */}
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="cep" className="font-bold">
                            CEP
                        </label>
                        {/* <InputText id="cep" value={user.cep} onChange={(e) => onInputChange(e, 'cep')} required className={classNames({ 'p-invalid': submitted && !user.cep })} /> */}
                        <InputMask id="cep" value={user.cep} onChange={(e) => onInputChange(e, 'cep')} mask="99999-999" placeholder="99999-999"
                        className={classNames({ 'p-invalid': submitted && !user.cep })}/>
                        {submitted && !user.cep && <small className="p-error">CEP é obrigatório!</small>}
                        {cepError && <small className="p-error">CEP inválido!</small>}
                    </div>
                    <div className="field col">
                        <label htmlFor="neighborhood" className="font-bold">
                            Bairro
                        </label>
                        <InputText id="neighborhood" value={user.neighborhood} disabled/>
                    </div>
                </div>

                {/* linha 4 */}
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="address" className="font-bold">
                            Endereço
                        </label>
                        <InputText id="address" value={user.address} disabled className="w-full md:w-26rem"/>
                    </div>
                    <div className="field col">
                        <label htmlFor="number" className="font-bold">
                            Número
                        </label>
                        <InputText id="neighborhood" value={user.number} onChange={(e) => onInputChange(e, 'number')}
                        className="w-full md:w-8rem"/>
                    </div>
                </div>

                {/* linha 5 */}
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="State" className="font-bold">
                            Estado
                        </label>
                        <Dropdown value={selectedState} onChange={(e) => selectState(e)} options={state} optionLabel="name" 
                        placeholder="Selecione o estado" className="w-full md:w-17rem" />
                    </div>
                    <div className="field col">
                        <label htmlFor="City" className="font-bold">
                            Cidade
                        </label>
                        <Dropdown value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={cities} optionLabel="name" 
                        placeholder="Selecione o cidade" className="w-full md:w-17rem" />
                    </div>
                </div>  
            </Dialog>

            <Dialog visible={deleteUserDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmação" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {user && (
                        <span>
                            Tem certeza que deseja deletar <b>{user.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
        