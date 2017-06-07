var account = new PouchDB('account');

function d(){
	account.destroy();
};

account.changes({
  since: 'now',
  live: true
}).on('change', accountDocs);

function getVal(){
	var name 	= document.querySelector('input#name').value,
		bName 	= document.querySelector('input#bName').value,
		contact = document.querySelector('input#contact').value,
		address = document.querySelector('input#address').value,
		accountT = document.querySelector('input#aT').value,
		discount= document.querySelector('input#discount').value
	if(name === '' | bName === '' | contact === '' | address === '' | accountT === '' | discount === '') {
		Materialize.toast('Please complete the fields')
	} else {
		newAccount(name, bName, contact, address, accountT, discount);
	}
}

function newAccount(name, bName, contact, address, accountT, discount) {
	var doc = {
		"_id": name + '_' + new Date().toISOString(),
		"name": name,
		"business_name": bName,
		"contact": contact,
		"address": address,
		"account_type": accountT,
		"total_sales": 0,
		"discount": discount
	}
	
	account.put(doc).then(function(results){
		console.log(results)
		Materialize.toast('Succesfull added account', 4000)
	}).catch(function(err){
		console.log(err);
	});
}

function accountDocs(){
	account.allDocs({include_docs:true, descending: false}, function(err, doc){
		displayAccounts(doc.rows);
	}).catch(function(err){
		console.log(err)
	});
};

function displayAccounts(data){
	var ul = document.createElement('ul');
	ul.id = 'ulDisp';
	ul.className = 'collection';
	var aD = document.querySelector('div#accountDisplay');
	aD.innerHTML = '' // Clear child-elements in div#accountDisplay
	aD.appendChild(ul);
	
	// New account 
	var aNew = document.createElement('a');
	aNew.setAttribute('href', '#addAccount');
	aNew.className = 'modal-trigger z-depth-0 collection-item indigo-text text-lighten-3 btn waves-effect waves-light';
	aNew.innerHTML = 'Create Account';
	ul.appendChild(aNew)
	
	data.forEach(function(data){
		ul.appendChild(collection(data.doc));
	})
}

function collection(data){
	var li = document.createElement('li');
	var title = document.createElement('span');
	var contribute = document.createElement('p');
	var details = document.createElement('p');
	var deleteBtn = document.createElement('a');

	li.className = 'collection-item avatar';
	
	title.className = 'title';
	title.setAttribute('style', 'font-variant: petite-caps;')
	title.innerHTML = data.name + ' (' + data.account_type + ' Discount ' + data.discount + '%' + ')';

	details.setAttribute('style', 'font-variant: petite-caps;')
	details.innerHTML = data.business_name + '<br>' + data.address + '<br>' + data.contact + '<br>' + data.total_sales + ' Php sales' 
	deleteBtn.innerHTML = 'Delete'
	deleteBtn.className = 'btn red waves-effect waves-light secondary-content';
	deleteBtn.addEventListener('click', deleteButtonPressed.bind(this, data));

	li.appendChild(title);
	li.appendChild(contribute)
	li.appendChild(details);
	li.appendChild(deleteBtn);
	return li
}

function deleteButtonPressed(doc){
	account.remove(doc);
	Materialize.toast('Account Deleted!', 4000)
}

accountDocs();