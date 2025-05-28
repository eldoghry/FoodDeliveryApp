import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import { StatusCodes } from 'http-status-codes';

export abstract class BaseAxios {
	readonly axios: AxiosInstance;
	NAME: string = '';

	constructor(name: string, baseURL: string, config?: AxiosRequestConfig) {
		this.NAME = name;
		this.axios = axios.create({
			baseURL,
			...config
		});

		this._initializeRequestInterceptor();
		this._initializeResponseInterceptor();
	}

	private _initializeRequestInterceptor() {
		this.axios.interceptors.request.use(this._handleRequest.bind(this));
	}
	private _initializeResponseInterceptor() {
		this.axios.interceptors.response.use(this._handleResponse.bind(this), this._handleError.bind(this));
	}

	private async _handleRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
		config.headers.set('request-start-time', Date.now().toString());
		// const logData = {
		// 	baseUrl: config.baseURL,
		// 	url: config.url,
		// 	method: config.method,
		// 	data: config.data,
		// 	params: config.params,
		// 	header: config.headers
		// };
		// logger.info(`${this.NAME} Axios request`, logData);
		return config;
	}

	private _handleResponse(response: AxiosResponse) {
		const logData = {
			baseUrl: response.config.baseURL,
			url: response.config.url,
			method: response.config.method,
			data: response.data
		};

		// logger.info(`${this.NAME} Axios response`, response.data);

		return response.data;
	}
	private _handleError(error: any) {
		const errMsg = error instanceof Error ? error.message : String(error);
		const errData = (error as any)?.response?.data;

		logger.error(`${this.NAME} axios login error`, { message: errMsg, data: errData });
		throw new ApplicationError(`${this.NAME} login is down`, StatusCodes.SERVICE_UNAVAILABLE, false, errData);
	}
}
