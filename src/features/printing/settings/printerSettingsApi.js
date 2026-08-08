import apiClient from '../../../utils/apiClient.js'
import { createPrinterSettingsApi as createApi, unwrapData } from './printerSettingsApiFactory.js'

const createPrinterSettingsApi = ({ client = apiClient } = {}) => createApi({ client })

export { createPrinterSettingsApi, unwrapData }
export default createPrinterSettingsApi
