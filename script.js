    // API endpoints
        const apiUrl = 'https://api.github.com/users/';
        const searchApiUrl = 'https://api.github.com/search/users?q=';
        // DOM elements
        const main = document.getElementById('main');
        const form = document.getElementById('form');
        const search = document.getElementById('search');
        const autocompleteList = document.getElementById('autocomplete-list');
        // Debounce timeout variable
        let debounceTimeout;
        // Event listener for search input (debounced autocomplete)
        search.addEventListener('input', () => {
            const query = search.value.trim();
            clearTimeout(debounceTimeout);
            if (query.length > 0) {
                debounceTimeout = setTimeout(() => {
                    fetchSuggestions(query);
                }, 300);
            } else {
                autocompleteList.innerHTML = '';
            }
        });
        // Event listener for autocomplete selection
        autocompleteList.addEventListener('click', (e) => {
            if (e.target && e.target.matches('.autocomplete-item')) {
                search.value = e.target.textContent;
                autocompleteList.innerHTML = '';
                getUser(search.value.trim());
                search.value = '';
            }
        });
        // Event listener for form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = search.value.trim();
            if (username) {
                autocompleteList.innerHTML = '';
                getUser(username);
                search.value = '';
            }
        });
        // Fetch user suggestions based on search query
        async function fetchSuggestions(query) {
            try {
                const response = await axios.get(`${searchApiUrl}${query}&per_page=5`);
                const users = response.data.items;
                autocompleteList.innerHTML = '';
                users.forEach(user => {
                    const item = document.createElement('div');
                    item.classList.add('autocomplete-item');
                    item.textContent = user.login;
                    autocompleteList.appendChild(item);
                });
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        }
        // Fetch user profile data and display card
        async function getUser(username) {
            showLoader();
            try {
                const { data } = await axios.get(apiUrl + username);
                createUserCard(data);
                getRepos(username);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    createErrorCard('No profile with this username');
                } else {
                    createErrorCard('An error occurred');
                }
            }
        }
        // Fetch user repositories and display them
        async function getRepos(username) {
            try {
                const { data } = await axios.get(`${apiUrl}${username}/repos?sort=created`);
                addReposToCard(data);
            } catch (error) {
                console.error('Error fetching repos:', error);
            }
        }
        // Display loading spinner
        function showLoader() {
            main.innerHTML = '<div class="loader"></div>';
        }
        // Create user profile card
        function createUserCard(user) {
            const cardHTML = `
                <div class="card">
                    <div>
                        <img src="${user.avatar_url}" alt="${user.name}" class="avatar">
                    </div>
                    <div class="search-info">
                        <h2>${user.name || user.login}</h2>
                        <p>${user.bio || 'No bio available'}</p>
                        <ul>
                            <li><strong>Followers:</strong> ${user.followers}</li>
                            <li><strong>Following:</strong> ${user.following}</li>
                            <li><strong>Public Repos:</strong> ${user.public_repos}</li>
                            <li><strong>Location:</strong> ${user.location || 'N/A'}</li>
                            <li><strong>Email:</strong> ${user.email || 'N/A'}</li>
                            <li><strong>Website:</strong> ${user.blog ? `<a href="${user.blog}" target="_blank">${user.blog}</a>` : 'N/A'}</li>
                        </ul>
                        <div id="repos"></div>
                    </div>
                </div>
            `;
            main.innerHTML = cardHTML;
        }
        // Create error card
        function createErrorCard(message) {
            const cardHTML = `
                <div class="card">
                    <h1>${message}</h1>
                </div>
            `;
            main.innerHTML = cardHTML;
        }
        // Add repository links to the card
        function addReposToCard(repos) {
            const reposEl = document.getElementById('repos');
            repos.slice(0, 5).forEach(repo => {
                const repoEl = document.createElement('a');
                repoEl.classList.add('repo');
                repoEl.href = repo.html_url;
                repoEl.target = '_blank';
                repoEl.innerText = repo.name;
                reposEl.appendChild(repoEl);
            });
        }