const addToTasks = document.querySelector('ul');
const taskTitle = document.querySelector('.taskTitle');
const taskDesc = document.querySelector('.taskDesc');
const formSubmit = document.querySelector('form');

//declaring a db that holds previously stored data
let db;

window.onload = function(){
    let request = window.indexedDB.open('notes_db',1);
   request.onerror = function(){
       console.log("Database failed to open");
   }

   request.onsuccess = function(){
       console.log("Database successfully opened");
       db = request.result;
       displayData();                 
   }

   request.onupgradeneeded = function(e){
       db = e.target.result;

       let objectStore = db.createObjectStore('Tasks',{keyPath:'id',autoIncrement:true});
       objectStore.createIndex('title','title',{ unique:false });
       objectStore.createIndex('body','body',{ unique:false });

       console.log("Db setup completed");
   }

   formSubmit.onsubmit = addTask;
   
   function addTask(e){
        e.preventDefault();
        let newTask = {
            title: taskTitle.value,
            body: taskDesc.value,
        };

        let transaction = db.transaction(['Tasks'],'readwrite');

        let objectStore = transaction.objectStore('Tasks');

        let request = objectStore.add(newTask);
        request.onsuccess = function(){
            taskTitle.value = "";
            taskDesc.value = "";
        };
        
        transaction.oncomplete = function(){
            console.log("Database modified");
            displayData();
        };
        transaction.onerror = function(){
            console.log("Database transaction error");
        };
   }

   function displayData(){
       
       while (addToTasks.firstChild){
           addToTasks.removeChild(addToTasks.firstChild);
       }

       let objectStore = db.transaction('Tasks').objectStore('Tasks');
       objectStore.openCursor().onsuccess = function(e){
           let cursor = e.target.result;

           if(cursor){
               const listItem = document.createElement('li');
               const para = document.createElement('p');
               const h3 = document.createElement('h3');
               
               h3.textContent = cursor.value.title;
               para.textContent = cursor.value.body;

               listItem.appendChild(h3);
               listItem.appendChild(para);
               addToTasks.appendChild(listItem);

               listItem.setAttribute('data-node-id',cursor.value.id);

               const deleteButton = document.createElement('button');
               listItem.appendChild(deleteButton);
               deleteButton.textContent = "Delete";
               deleteButton.onclick = deleteItem;

               cursor.continue();
           }else{
                if(!addToTasks.firstChild){
                    const listItem = document.createElement('li');
                    listItem.textContent = 'No recent tasks..';
                    addToTasks.appendChild(listItem);
                }
                console.log('tasks displayed');
           }

   };
}
function deleteItem(e){
               let taskId = Number(e.target.parentNode.getAttribute('data-node-id'));

               let transaction = db.transaction(['Tasks'],'readwrite');
               let objectStore = transaction.objectStore('Tasks');
               let request = objectStore.delete(taskId);

               transaction.oncomplete = function(){

                   e.target.parentNode.parentNode.removeChild(e.target.parentNode);
                //    addToTasks.removeChild(e.target.listItem);                         
                   console.log('Task ' + taskId + ' completed/deleted.');

                   if(!addToTasks.firstChild) {
                        let listItem = document.createElement('li');
                        listItem.textContent = 'No recent tasks..';
                        addToTasks.appendChild(listItem);
                    }
               } 

               transaction.onerror = function(){
                   console.log("error deleting");
               }
               
           }
       
}