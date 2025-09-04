class MongoBackupUI {
    constructor() {
        this.initEventListeners();
        this.selectedCollections = new Set();
    }

    initEventListeners() {
        // Load databases
        document.getElementById('loadDatabasesBtn').addEventListener('click', () => this.loadDatabases());
        
        // Load collections
        document.getElementById('loadCollectionsBtn').addEventListener('click', () => this.loadCollections());
        
        // Database selection
        document.getElementById('availableDatabases').addEventListener('change', (e) => {
            if (e.target.value) {
                document.getElementById('sourceDatabaseName').value = e.target.value;
                document.getElementById('loadCollectionsBtn').disabled = false;
                this.updateTargetDatabaseName();
            }
        });

        // Source database name change
        document.getElementById('sourceDatabaseName').addEventListener('input', () => {
            this.updateTargetDatabaseName();
            this.validateForm();
        });

        // Same as source checkbox
        document.getElementById('sameAsSource').addEventListener('change', () => this.updateTargetDatabaseName());

        // Target database name change
        document.getElementById('targetDatabaseName').addEventListener('input', () => this.validateForm());

        // URI changes
        document.getElementById('sourceUri').addEventListener('input', () => this.validateForm());
        document.getElementById('targetUri').addEventListener('input', () => this.validateForm());

        // Form submission
        document.getElementById('backupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startBackup();
        });

        // Reset form
        document.getElementById('resetFormBtn').addEventListener('click', () => this.resetForm());
    }

    async loadDatabases() {
        const sourceUri = document.getElementById('sourceUri').value.trim();
        if (!sourceUri) {
            this.showAlert('Please enter a source MongoDB URI first', 'warning');
            return;
        }

        const loadBtn = document.getElementById('loadDatabasesBtn');
        const originalText = loadBtn.innerHTML;
        loadBtn.innerHTML = '<div class="loading-spinner"></div> Loading...';
        loadBtn.disabled = true;

        try {
            const response = await fetch(`/api/databases?uri=${encodeURIComponent(sourceUri)}`);
            const data = await response.json();

            if (data.success) {
                const select = document.getElementById('availableDatabases');
                select.innerHTML = '';
                select.disabled = false;

                data.databases.forEach(db => {
                    const option = document.createElement('option');
                    option.value = db.name;
                    option.textContent = `${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`;
                    select.appendChild(option);
                });

                this.showAlert(`Found ${data.databases.length} databases`, 'success');
            } else {
                this.showAlert(`Error loading databases: ${data.error}`, 'danger');
            }
        } catch (error) {
            this.showAlert(`Error loading databases: ${error.message}`, 'danger');
        } finally {
            loadBtn.innerHTML = originalText;
            loadBtn.disabled = false;
        }
    }

    async loadCollections() {
        const sourceUri = document.getElementById('sourceUri').value.trim();
        const dbName = document.getElementById('sourceDatabaseName').value.trim();

        if (!sourceUri || !dbName) {
            this.showAlert('Please enter source URI and database name first', 'warning');
            return;
        }

        const loadBtn = document.getElementById('loadCollectionsBtn');
        const originalText = loadBtn.innerHTML;
        loadBtn.innerHTML = '<div class="loading-spinner"></div> Loading...';
        loadBtn.disabled = true;

        try {
            const response = await fetch(`/api/collections/${encodeURIComponent(dbName)}?uri=${encodeURIComponent(sourceUri)}`);
            const data = await response.json();

            if (data.success) {
                await this.renderCollections(data.collections, sourceUri, dbName);
                this.validateForm();
            } else {
                this.showAlert(`Error loading collections: ${data.error}`, 'danger');
            }
        } catch (error) {
            this.showAlert(`Error loading collections: ${error.message}`, 'danger');
        } finally {
            loadBtn.innerHTML = originalText;
            loadBtn.disabled = false;
        }
    }

    async renderCollections(collections, sourceUri, dbName) {
        const container = document.getElementById('collectionsContainer');
        container.innerHTML = '';

        if (collections.length === 0) {
            container.innerHTML = '<div class="text-muted text-center py-3">No collections found</div>';
            return;
        }

        // Select all checkbox
        const selectAllDiv = document.createElement('div');
        selectAllDiv.className = 'collection-item';
        selectAllDiv.innerHTML = `
            <input type="checkbox" id="selectAll" class="form-check-input">
            <label for="selectAll" class="form-check-label fw-bold">
                Select All (${collections.length} collections)
            </label>
        `;
        container.appendChild(selectAllDiv);

        const selectAllCheckbox = selectAllDiv.querySelector('#selectAll');
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = container.querySelectorAll('input[type="checkbox"]:not(#selectAll)');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                if (e.target.checked) {
                    this.selectedCollections.add(cb.value);
                } else {
                    this.selectedCollections.delete(cb.value);
                }
            });
            this.validateForm();
        });

        // Individual collection checkboxes
        for (const collection of collections) {
            const stats = await this.getCollectionStats(sourceUri, dbName, collection.name);
            
            const collectionDiv = document.createElement('div');
            collectionDiv.className = 'collection-item';
            
            collectionDiv.innerHTML = `
                <input type="checkbox" value="${collection.name}" id="coll_${collection.name}" class="form-check-input">
                <label for="coll_${collection.name}" class="form-check-label">
                    ${collection.name}
                </label>
                <div class="collection-stats">
                    ${stats ? `📊 ${stats.documentCount.toLocaleString()} documents` : ''}
                </div>
            `;

            const checkbox = collectionDiv.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedCollections.add(e.target.value);
                } else {
                    this.selectedCollections.delete(e.target.value);
                    selectAllCheckbox.checked = false;
                }
                this.validateForm();
            });

            container.appendChild(collectionDiv);
        }
    }

    async getCollectionStats(sourceUri, dbName, collectionName) {
        try {
            const response = await fetch(`/api/collection-stats/${encodeURIComponent(dbName)}/${encodeURIComponent(collectionName)}?uri=${encodeURIComponent(sourceUri)}`);
            const data = await response.json();
            return data.success ? data.stats : null;
        } catch (error) {
            return null;
        }
    }

    updateTargetDatabaseName() {
        const sourceDbName = document.getElementById('sourceDatabaseName').value.trim();
        const sameAsSource = document.getElementById('sameAsSource').checked;
        const targetDbInput = document.getElementById('targetDatabaseName');

        if (sameAsSource && sourceDbName) {
            targetDbInput.value = sourceDbName;
            targetDbInput.readOnly = true;
        } else {
            targetDbInput.readOnly = false;
        }
    }

    validateForm() {
        const sourceUri = document.getElementById('sourceUri').value.trim();
        const targetUri = document.getElementById('targetUri').value.trim();
        const sourceDb = document.getElementById('sourceDatabaseName').value.trim();
        const targetDb = document.getElementById('targetDatabaseName').value.trim();
        const hasCollections = this.selectedCollections.size > 0;

        const isValid = sourceUri && targetUri && sourceDb && targetDb && hasCollections;
        document.getElementById('startBackupBtn').disabled = !isValid;
    }

    async startBackup() {
        const formData = {
            sourceUri: document.getElementById('sourceUri').value.trim(),
            targetUri: document.getElementById('targetUri').value.trim(),
            sourceDbName: document.getElementById('sourceDatabaseName').value.trim(),
            targetDbName: document.getElementById('targetDatabaseName').value.trim(),
            selectedCollections: Array.from(this.selectedCollections),
            clearTarget: document.getElementById('clearTarget').checked
        };

        // Show progress card
        document.getElementById('progressCard').style.display = 'block';
        document.getElementById('resultsCard').style.display = 'none';
        
        const progressBar = document.querySelector('.progress-bar');
        const progressLog = document.getElementById('progressLog');
        
        progressBar.style.width = '0%';
        progressLog.innerHTML = '';
        
        // Disable form
        document.getElementById('startBackupBtn').disabled = true;
        document.getElementById('startBackupBtn').innerHTML = '<div class="loading-spinner"></div> Backing up...';

        try {
            this.addLogEntry('🚀 Starting backup process...', 'info');
            
            const response = await fetch('/api/copy-selected-collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                progressBar.style.width = '100%';
                this.addLogEntry('✅ Backup completed successfully!', 'success');
                this.showResults(data.result);
            } else {
                this.addLogEntry(`❌ Backup failed: ${data.error}`, 'error');
            }
        } catch (error) {
            this.addLogEntry(`❌ Backup failed: ${error.message}`, 'error');
        } finally {
            // Re-enable form
            document.getElementById('startBackupBtn').innerHTML = '<i class="fas fa-play me-2"></i>Start Backup';
            this.validateForm();
        }
    }

    addLogEntry(message, type = 'info') {
        const progressLog = document.getElementById('progressLog');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
        progressLog.appendChild(entry);
        progressLog.scrollTop = progressLog.scrollHeight;
    }

    showResults(result) {
        document.getElementById('resultsCard').style.display = 'block';
        const resultsContent = document.getElementById('resultsContent');
        
        const duration = new Date(result.endTime) - new Date(result.startTime);
        
        resultsContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6><i class="fas fa-info-circle me-2"></i>Backup Summary</h6>
                    <ul class="list-unstyled">
                        <li><strong>Source Database:</strong> ${result.sourceDb}</li>
                        <li><strong>Target Database:</strong> ${result.targetDb}</li>
                        <li><strong>Collections Copied:</strong> ${result.collectionsCopied.length}</li>
                        <li><strong>Total Documents:</strong> ${result.totalDocuments.toLocaleString()}</li>
                        <li><strong>Duration:</strong> ${(duration / 1000).toFixed(2)} seconds</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6><i class="fas fa-list me-2"></i>Collection Details</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Collection</th>
                                    <th>Documents</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.collectionsCopied.map(coll => `
                                    <tr>
                                        <td>${coll.name}</td>
                                        <td class="collection-count">${coll.documentCount.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    showAlert(message, type) {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(alert, container.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    resetForm() {
        document.getElementById('backupForm').reset();
        document.getElementById('availableDatabases').innerHTML = '<option>Click "Load" to fetch databases</option>';
        document.getElementById('availableDatabases').disabled = true;
        document.getElementById('loadCollectionsBtn').disabled = true;
        document.getElementById('collectionsContainer').innerHTML = '<div class="text-muted text-center py-3"><i class="fas fa-info-circle me-1"></i>Load collections to select them</div>';
        document.getElementById('progressCard').style.display = 'none';
        document.getElementById('resultsCard').style.display = 'none';
        this.selectedCollections.clear();
        this.validateForm();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new MongoBackupUI();
});
