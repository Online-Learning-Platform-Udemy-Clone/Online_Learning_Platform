import { installDevConsoleFilters } from './utils/consoleFilters.js'
import { installApiClient } from './utils/apiClient.js'
import './index.css'

installDevConsoleFilters()
installApiClient()

import('./bootstrap.jsx')
