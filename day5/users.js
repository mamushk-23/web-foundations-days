const loadUsersBtn = document.querySelector('#load-users');
const filterInput = document.querySelector('#filter-input');
const statusPara = document.querySelector('#status');
const usersList = document.querySelector('#users-list');

// Store loaded users in memory so we don't need to fetch again
let allUsers = []; 

async function loadUsers() {
    // 1. Loading state
    loadUsersBtn.disabled = true;
    filterInput.disabled = true;
    statusPara.textContent = 'Loading users...';
    usersList.innerHTML = '';

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        
        // 2. Check response.ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allUsers = await response.json();
        
        // 3. Success state
        statusPara.textContent = `Successfully loaded ${allUsers.length} users.`;
        filterInput.disabled = false;
        
        renderUsers(allUsers);
        
    } catch (error) {
        // 4. Error state
        statusPara.textContent = 'Error loading users. Please try again later.';
        console.error('Fetch error:', error);
    } finally {
        // 5. Re-enable button regardless of success or failure
        loadUsersBtn.disabled = false;
    }
}

function renderUsers(usersToRender) {
    usersList.innerHTML = ''; // Clear current list

    if (usersToRender.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No users match your filter.';
        usersList.appendChild(li);
        return;
    }

    usersToRender.forEach(user => {
        const li = document.createElement('li');
        
        const nameEl = document.createElement('strong');
        nameEl.textContent = user.name;
        li.appendChild(nameEl);
        
        const emailEl = document.createElement('div');
        emailEl.textContent = `Email: ${user.email}`;
        li.appendChild(emailEl);
        
        const cityEl = document.createElement('div');
        cityEl.textContent = `City: ${user.address.city}`;
        li.appendChild(cityEl);
        
        const companyEl = document.createElement('div');
        companyEl.textContent = `Company: ${user.company.name}`;
        li.appendChild(companyEl);
        
        usersList.appendChild(li);
    });
}

// Event listener for the load button
loadUsersBtn.addEventListener('click', loadUsers);

// Event listener for the filter input (no new fetch requests made)
filterInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm)
    );
    
    renderUsers(filteredUsers);
});