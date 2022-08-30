"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var RexComponent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RexComponent = void 0;
const core_1 = require("@angular/core");
const accounts_service_1 = require("../../services/accounts.service");
const textMaskAddons_1 = require("text-mask-addons/dist/textMaskAddons");
const forms_1 = require("@angular/forms");
const router_1 = require("@angular/router");
const crypto_service_1 = require("../../services/crypto/crypto.service");
const eosjs2_service_1 = require("../../services/eosio/eosjs2.service");
const transaction_factory_service_1 = require("../../services/eosio/transaction-factory.service");
const rex_charts_service_1 = require("../../services/rex-charts.service");
const modal_state_service_1 = require("../../services/modal-state.service");
const network_service_1 = require("../../services/network.service");
const moment = require("moment");
const http_1 = require("@angular/common/http");
const common_1 = require("@angular/common");
let RexComponent = RexComponent_1 = class RexComponent {
    constructor(http, fb, trxFactory, aService, network, router, mds, eosjs, crypto, rexCharts) {
        this.http = http;
        this.fb = fb;
        this.trxFactory = trxFactory;
        this.aService = aService;
        this.network = network;
        this.router = router;
        this.mds = mds;
        this.eosjs = eosjs;
        this.crypto = crypto;
        this.rexCharts = rexCharts;
        this.canbuyREX = false;
        this.showAdvancedRatio = false;
        this.REXtoBuy = 0;
        this.salesResult = 0;
        this.REXfromStake = 0;
        this.REXfromCPU = 0;
        this.REXfromNET = 0;
        this.borrowAccErrorMsg = '';
        this.numberMask = (0, textMaskAddons_1.createNumberMask)({
            prefix: '',
            allowDecimal: true,
            includeThousandsSeparator: false,
            decimalLimit: 4,
        });
        this.advCpuConvertError = '';
        this.advNetConvertError = '';
        this.cpuCost = 0;
        this.netCost = 0;
        this.totalCost = 0;
        this.borrowCpuError = '';
        this.borrowNetError = '';
        this.borrowRenewalError = '';
        this.REXamounterror = '';
        this.convertAmountError = '';
        this.intervalOptions = [
            { label: '2 hours', range: '2h', step: '5m' },
            { label: '6 hours', range: '6h', step: '15m' },
            { label: '24 hours', range: '24h', step: '30m' },
            { label: '3 days', range: '3d', step: '2h' },
            { label: '2 weeks', range: '2w', step: '6h' },
            { label: '2 months', range: '60d', step: '1d' },
            { label: '1 year', range: '365d', step: '1w' }
        ];
        this.total_unlent = 0.0;
        this.total_lent = 0.0;
        this.total_rent = 0.0;
        this.mode = 'local';
        this.selectedInterval = this.intervalOptions[1];
        this.busy = true;
        this.rexBuckets = [];
        this.matBucket = [];
        this.rexPrice = 0;
        this.rexLiquid = 0;
        this.rexFund = 0;
        this.rexSavings = 0;
        this.rexMaturing = 0;
        this.totalRexBalance = 0;
        this.lastSelectedAccount = '';
        this.rexPriceChartMerge = [];
        this.borrowingCost = 0;
        this.cpu_weight = 0;
        this.net_weight = 0;
        this.myLoans = {
            cpu: [],
            net: []
        };
        // Setup Forms
        this.passFormVote = this.fb.group({
            pass: ['', [forms_1.Validators.required, forms_1.Validators.minLength(4)]]
        });
        this.buyForm = this.fb.group({
            EOSamount: ['', forms_1.Validators.min(0)],
        });
        this.sellForm = this.fb.group({
            REXamount: ['', forms_1.Validators.min(0)],
            auto: [true]
        });
        this.convertForm = this.fb.group({
            EOSamount: ['', forms_1.Validators.min(0)],
        });
        this.stakeForm = this.fb.group({
            amount: ['', forms_1.Validators.min(0)],
        });
        this.advancedConvertForm = this.fb.group({
            cpu: [0, forms_1.Validators.min(0)],
            net: [0, forms_1.Validators.min(0)]
        });
        this.borrowForm = this.fb.group({
            CPUamount: [0, forms_1.Validators.min(0)],
            NETamount: [0, forms_1.Validators.min(0)],
            renewal: ['', forms_1.Validators.min(0)],
            accountReceiver: [''],
            account: ['', forms_1.Validators.required]
        });
        // Setup subscriptions
        this.subscriptions = [];
        this.subscriptions.push(this.rexCharts.rexPriceChart.asObservable().subscribe(data => {
            if (data) {
                this.updatePriceChart(data);
            }
        }));
        this.subscriptions.push(this.rexCharts.borrowingCostChart.asObservable().subscribe(data => {
            if (data) {
                this.updateBorrowingChart(data);
            }
        }));
        this.subscriptions.push(this.buyForm.get('EOSamount').valueChanges.subscribe(value => {
            if (this.rexPrice !== 0) {
                this.REXtoBuy = value / this.rexPrice;
            }
            else {
                this.REXtoBuy = 0;
            }
            this.checkTotal();
        }));
        this.subscriptions.push(this.sellForm.get('REXamount').valueChanges.subscribe(value => {
            if (this.rexPrice !== 0) {
                this.salesResult = value * this.rexPrice;
            }
            else {
                this.salesResult = 0;
            }
        }));
        this.subscriptions.push(this.convertForm.get('EOSamount').valueChanges.subscribe(value => {
            if (this.rexPrice !== 0) {
                this.REXfromStake = value / this.rexPrice;
            }
            else {
                this.REXfromStake = 0;
            }
            this.checkTotal();
        }));
        this.subscriptions.push(this.advancedConvertForm.get('cpu').valueChanges.subscribe(val => {
            if (val !== '') {
                if (parseFloat(val) > this.aService.selected.getValue().details.self_delegated_bandwidth.cpu_weight.split(' ')[0]) {
                    this.advancedConvertForm.controls['cpu'].setErrors({ 'incorrect': true });
                    this.advCpuConvertError = 'invalid amount';
                }
                else {
                    const sum = parseFloat(val) + parseFloat(this.advancedConvertForm.get('net').value);
                    if (val > 0) {
                        this.REXfromCPU = val / this.rexPrice;
                    }
                    else {
                        this.REXfromCPU = 0;
                    }
                    this.convertForm.patchValue({
                        EOSamount: sum
                    });
                }
            }
            else {
                this.REXfromCPU = 0;
            }
        }));
        this.subscriptions.push(this.advancedConvertForm.get('net').valueChanges.subscribe(val => {
            if (val !== '') {
                if (parseFloat(val) > this.aService.selected.getValue().details.self_delegated_bandwidth.net_weight.split(' ')[0]) {
                    this.advancedConvertForm.controls['net'].setErrors({ 'incorrect': true });
                    this.advNetConvertError = 'invalid amount';
                }
                else {
                    const sum = parseFloat(val) + parseFloat(this.advancedConvertForm.get('cpu').value);
                    if (val > 0) {
                        this.REXfromNET = val / this.rexPrice;
                    }
                    else {
                        this.REXfromNET = 0;
                    }
                    this.convertForm.patchValue({
                        EOSamount: sum
                    });
                }
            }
            else {
                this.REXfromNET = 0;
            }
        }));
        this.subscriptions.push(this.aService.selected.asObservable().subscribe((sel) => {
            if (Object.keys(sel).length > 0) {
                const d = sel.details;
                this.fromAccount = d.account_name;
                if (this.fromAccount !== this.lastSelectedAccount) {
                    this.lastSelectedAccount = this.fromAccount;
                    this.fullBalance = sel.full_balance;
                    this.allStakes = sel.staked;
                    this.unstaking = sel.unstaking;
                    this.updateAccountBalances(d);
                    this.checkRequirements(d);
                    this.updateREXData(sel.details.account_name);
                    // this.loadRexHistory().catch(console.log);
                }
            }
        }));
        this.subscriptions.push(this.network.networkingReady.subscribe(state => {
            if (state) {
                this.updateGlobalRexData();
            }
        }));
        let color = document.documentElement.style.getPropertyValue('--text-highlight');
        if (color === '') {
            color = '#ffffff';
        }
        // Setup Charts
        this.rex_price_chart = {
            title: {
                left: 'center',
                subtext: 'REX/EOS price',
                subtextStyle: { color: color, fontWeight: 'bold' },
                top: '20'
            },
            grid: { height: '80%', width: '75%', right: '30', top: '11' },
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    params = params[0];
                    return `
						${moment(params.name, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('HH:mm[\n]DD/MM/YYYY')}
						<br>
						${params.value.toFixed(12)}
						<br>
						1 ${this.aService.activeChain['symbol']} = ${(1 / params.value).toFixed(4)} REX
					`;
                },
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: [],
                axisLine: { lineStyle: { color: '#B7B7B7' } },
                axisLabel: {
                    textStyle: { color: '#B7B7B7' },
                    formatter: function (params) {
                        return moment(params, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('HH:mm[\n]DD/MM');
                    },
                },
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                axisLine: { lineStyle: { color: '#B7B7B7' } },
                axisLabel: { textStyle: { color: '#B7B7B7' }, show: false },
                splitLine: { lineStyle: { color: '#3c3a3a' } },
                scale: true
            },
            series: [{
                    name: 'REX price',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    sampling: 'average',
                    itemStyle: { normal: { color: 'rgb(0, 148, 210)' } },
                    areaStyle: {
                        color: {
                            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgb(149, 223, 255, 0.6)' },
                                { offset: 1, color: 'rgb(0, 143, 203, 0.1)' }
                            ],
                        }
                    },
                    data: []
                }]
        };
        this.borrow_cost_chart = {
            title: {
                left: 'center',
                subtext: 'borrowing cost',
                subtextStyle: { color: color, fontWeight: 'bold' },
                top: '20'
            },
            grid: { height: '80%', width: '75%', right: '30', top: '11' },
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    params = params[0];
                    return `
						${moment(params.name, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('HH:mm[\n]DD/MM/YYYY')}
						<br>
						${params.value.toFixed(12)}
						<br>
						1 ${this.aService.activeChain['symbol']} = ${(1 / params.value).toFixed(4)} ${this.aService.activeChain['symbol']}
					`;
                },
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: [],
                axisLine: { lineStyle: { color: '#B7B7B7' } },
                axisLabel: {
                    textStyle: { color: '#B7B7B7' },
                    formatter: function (params) {
                        return moment(params, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('HH:mm[\n]DD/MM');
                    },
                },
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                axisLine: { lineStyle: { color: '#B7B7B7' } },
                axisLabel: { textStyle: { color: '#B7B7B7' }, show: false },
                splitLine: { lineStyle: { color: '#3c3a3a' } },
                scale: true
            },
            series: [{
                    name: 'borrowing cost',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    sampling: 'average',
                    itemStyle: { normal: { color: 'rgb(0, 148, 210)' } },
                    areaStyle: {
                        color: {
                            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgb(149, 223, 255, 0.6)' },
                                { offset: 1, color: 'rgb(0, 143, 203, 0.1)' }
                            ],
                        }
                    },
                    data: []
                }]
        };
        this.reloadChart();
    }
    static asset2Float(asset) {
        if (asset === null || asset === undefined) {
            return 0.0;
        }
        return parseFloat(asset.split(' ')[0]);
    }
    static processLoans(arr) {
        for (const loan of arr) {
            loan['expires_in'] = moment.utc(loan.expiration).local().fromNow();
            loan['created_on'] = moment.utc(loan.expiration).local().subtract(30, 'd').format('DD/MM/YY HH:mm:ss');
        }
    }
    updateAccountBalances(d) {
        if (d.core_liquid_balance) {
            this.totalEOSliquid = RexComponent_1.asset2Float(d.core_liquid_balance);
        }
        else {
            this.totalEOSliquid = 0.0;
        }
        this.liquid = this.totalEOSliquid;
        if (d.self_delegated_bandwidth) {
            this.cpu_weight = parseFloat(d.self_delegated_bandwidth.cpu_weight.split(' ')[0]);
            this.net_weight = parseFloat(d.self_delegated_bandwidth.net_weight.split(' ')[0]);
            this.staked = this.cpu_weight + this.net_weight;
        }
        if (d.total_resources) {
            this.allStakes = parseFloat(d.total_resources.cpu_weight.split(' ')[0]) + parseFloat(d.total_resources.net_weight.split(' ')[0]);
        }
    }
    // async loadRexHistory() {
    //     const hyperionUrl = this.aService.activeChain['historyApi'];
    //     if (hyperionUrl !== '') {
    //         const account = this.aService.selected.getValue().name;
    //         const filters = 'eosio:withdraw,eosio:buyrex,eosio:unstaketorex,eosio:sellrex,eosio:deposit';
    //         const finalUrl = `${hyperionUrl}/history/get_actions?account=${account}&filter=${filters}`;
    //         console.log(finalUrl);
    //         const historyData: any = await this.http.get(finalUrl).toPromise();
    //         console.log(historyData);
    //         for (const action of historyData.actions) {
    //             const timestamp = moment(action['@timestamp']).format('DD/MM/YYYY HH:mm:ss');
    //             console.log(timestamp, action.act);
    //         }
    //     }
    // }
    updateNetCost() {
        const target = parseFloat(this.borrowForm.get('NETamount').value);
        if (isNaN(target)) {
            this.netCost = 0;
        }
        else {
            this.netCost = target / this.borrowingCost;
        }
        this.updateTotalCost();
        this.checkBorrowAmount();
    }
    updateCpuCost() {
        const target = parseFloat(this.borrowForm.get('CPUamount').value);
        if (isNaN(target)) {
            this.cpuCost = 0;
        }
        else {
            this.cpuCost = target / this.borrowingCost;
        }
        this.updateTotalCost();
        this.checkBorrowAmount();
    }
    updateTotalCost() {
        this.totalCost = this.cpuCost + this.netCost;
    }
    selectInterval(ev) {
        this.selectedInterval = this.intervalOptions.find(item => item.range === ev.value);
        this.reloadChart();
    }
    reloadChart() {
        this.rexCharts.loadCharts(this.selectedInterval.range, this.selectedInterval.step).catch(console.log);
    }
    updateREXData(account) {
        // Fetch current loans
        this.eosjs.getLoans(account).then((loans) => {
            RexComponent_1.processLoans(loans.cpu);
            RexComponent_1.processLoans(loans.net);
            this.myLoans = loans;
        }).catch(console.log);
        // Fetch user rex data
        this.eosjs.getRexData(account).then((rexdata) => __awaiter(this, void 0, void 0, function* () {
            const accountInfo = yield this.eosjs.rpc.get_account(account);
            this.updateAccountBalances(accountInfo);
            this.rexBuckets = [];
            this.matBucket = [];
            this.rexSavings = 0;
            this.rexMaturing = 0;
            this.rexLiquid = 0;
            this.rexFund = 0;
            this.totalRexBalance = 0;
            if (rexdata.rexbal) {
                this.totalRexBalance = RexComponent_1.asset2Float(rexdata.rexbal.rex_balance);
                if (rexdata.rexbal.rex_maturities.length > 0) {
                    for (const rexMat of rexdata.rexbal.rex_maturities) {
                        const maturityTime = (new Date(rexMat.key).getTime() - Date.now()) / (1000 * 60 * 60);
                        if (maturityTime > 128) {
                            this.rexSavings = rexMat.value / 10000;
                            rexMat['amount'] = rexMat.value / 10000;
                            this.matBucket.push(rexMat);
                        }
                        else if (maturityTime < 0) {
                            this.rexLiquid += rexMat.value / 10000;
                        }
                        else {
                            rexMat['unstakein'] = moment.utc(rexMat.key).fromNow();
                            rexMat['amount'] = rexMat.value / 10000;
                            rexMat['unstakedate'] = moment.utc(rexMat.key).local().format('DD/MM HH:mm');
                            this.rexBuckets.push(rexMat);
                            this.rexMaturing += rexMat['amount'];
                        }
                    }
                }
                if (rexdata.rexbal.matured_rex > 0) {
                    this.rexLiquid = rexdata.rexbal.matured_rex / 10000;
                }
            }
            if (rexdata.rexfund) {
                this.rexFund = parseFloat(rexdata.rexfund.balance.split(' ')[0]);
                if (this.rexFund > 0) {
                    this.totalEOSliquid += this.rexFund;
                }
            }
        }));
    }
    ngOnDestroy() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }
    checkTotal() {
        const v1 = this.buyForm.get('EOSamount').value;
        const v2 = this.convertForm.get('EOSamount').value;
        if (v1 !== '' && v2 !== '') {
            this.EOStotaltoBuy = parseFloat(v1) + parseFloat(v2);
        }
        else {
            if (v1 === '') {
                this.EOStotaltoBuy = parseFloat(v2);
            }
            else if (v2 === '') {
                this.EOStotaltoBuy = parseFloat(v1);
            }
        }
        this.REXtotaltoBuy = this.EOStotaltoBuy / this.rexPrice;
    }
    updatePriceChart(datapoints) {
        const dataDT = [];
        const dataVAL = [];
        let maxY = 0;
        let minY = 10000000;
        datapoints.forEach((val) => {
            dataDT.push(val.time);
            dataVAL.push(val.value);
            if (val.value > maxY) {
                maxY = val.value;
            }
            if (val.value < minY) {
                minY = val.value;
            }
        });
        this.rexPriceChartMerge = {
            xAxis: {
                data: dataDT
            },
            yAxis: {
                min: minY,
                max: maxY
            },
            series: {
                data: dataVAL
            }
        };
    }
    updateBorrowingChart(datapoints) {
        const dataDT = [];
        const dataVAL = [];
        let maxY = 0;
        let minY = 10000000;
        datapoints.forEach((val) => {
            dataDT.push(val.time);
            dataVAL.push(val.value);
            if (val.value > maxY) {
                maxY = val.value;
            }
            if (val.value < minY) {
                minY = val.value;
            }
        });
        this.borrowCostChartMerge = {
            xAxis: {
                data: dataDT
            },
            yAxis: {
                min: minY,
                max: maxY
            },
            series: {
                data: dataVAL
            }
        };
    }
    calculateRexPrice(rexpool) {
        const S0 = RexComponent_1.asset2Float(rexpool.total_lendable);
        const S1 = S0 + 1.0000;
        const R0 = RexComponent_1.asset2Float(rexpool.total_rex);
        const R1 = (S1 * R0) / S0;
        const rex_amount = R1 - R0;
        this.rexPrice = 1.0000 / rex_amount;
    }
    calculateBorrowingCost(rexpool) {
        const F0 = RexComponent_1.asset2Float(rexpool.total_rent);
        const T0 = RexComponent_1.asset2Float(rexpool.total_unlent);
        const I = 1.0000;
        let out = ((I * T0) / (I + F0));
        if (out < 0) {
            out = 0;
        }
        this.borrowingCost = out;
        // console.log(`1 EOS >> ${this.borrowingCost.toFixed(2)} EOS`);
    }
    checkRequirements(acc) {
        this.busy = false;
        if (acc.voter_info) {
            const voter = acc.voter_info;
            this.nVoters = voter.producers.length;
            // console.log(voter);
            if (voter.producers.length === 0) {
                this.canbuyREX = voter.proxy !== '';
            }
            else {
                this.canbuyREX = voter.producers.length >= 21;
            }
        }
        else {
            this.canbuyREX = false;
            this.nVoters = 0;
        }
    }
    createMoveToSavingModal() {
        this.mds.inputModal.hintHTML = `
				Liquid: ${(0, common_1.formatNumber)(this.rexLiquid, 'en-us', '1.0-4')} REX<br>
				Unstaking: ${(0, common_1.formatNumber)(this.rexMaturing, 'en-us', '1.0-4')}  REX<br>
				Total Available: ${(0, common_1.formatNumber)(this.rexLiquid + this.rexMaturing, 'en-us', '1.0-4')}  REX`;
        this.mds.inputModal.maxValue = this.rexLiquid + this.rexMaturing;
        this.mds.inputModal.inputPlaceholder = 'Amount (REX)';
        this.mds.inputModal.buttonText = 'NEXT';
        this.mds.inputModal.modalTitle = 'Stake your REX';
        this.mds.inputModal.modalTooltip = `Move REX to your savings account where it can't be sold until you request an unstake.`;
        const sub = this.mds.inputModal.event.subscribe((result) => {
            if (result.event === 'done') {
                this.moveToSavings(result.value).catch(console.log);
                sub.unsubscribe();
            }
            else if (result.event === 'close') {
                sub.unsubscribe();
            }
        });
        this.mds.inputModal.visibility = true;
    }
    createMoveFromSavingModal() {
        this.mds.inputModal.hintHTML = `
				Total Staked: ${(0, common_1.formatNumber)(this.matBucket[0].amount, 'en-us', '1.0-4')} REX`;
        this.mds.inputModal.maxValue = this.rexSavings;
        this.mds.inputModal.inputPlaceholder = 'Amount (REX)';
        this.mds.inputModal.buttonText = 'NEXT';
        this.mds.inputModal.modalTitle = 'Unstake your REX';
        this.mds.inputModal.modalTooltip = `Move REX out of your savings account so it can be sold after maturing. Unstaking takes at least 4 days to be completed.`;
        const sub = this.mds.inputModal.event.subscribe((result) => {
            if (result.event === 'done') {
                this.moveFromSavings(result.value).catch(console.log);
                sub.unsubscribe();
            }
            else if (result.event === 'close') {
                sub.unsubscribe();
            }
        });
        this.mds.inputModal.visibility = true;
    }
    createAddToLoanFundModal(event, type) {
        const loan_num = event.loan_num;
        this.mds.inputModal.hintHTML = `
				Total Available: ${(0, common_1.formatNumber)(this.totalEOSliquid, 'en-us', '1.0-4')} ${this.aService.activeChain.symbol}`;
        this.mds.inputModal.maxValue = this.totalEOSliquid;
        this.mds.inputModal.inputPlaceholder = `Amount (${this.aService.activeChain.symbol})`;
        this.mds.inputModal.buttonText = 'NEXT';
        this.mds.inputModal.modalTitle = 'Add funds to ' + type + ' loan #' + loan_num;
        this.mds.inputModal.modalTooltip = `Add more ${this.aService.activeChain.symbol} to the ${type} loan #${loan_num} renewal fund.`;
        const sub = this.mds.inputModal.event.subscribe((result) => {
            if (result.event === 'done') {
                this.fundLoan(type, result.value, loan_num).catch(console.log);
                sub.unsubscribe();
            }
            else if (result.event === 'close') {
                sub.unsubscribe();
            }
        });
        this.mds.inputModal.visibility = true;
    }
    createDefundModal(event, type) {
        const loan_num = event.loan_num;
        this.mds.inputModal.hintHTML = `
				Renewal fund balance: ${event.balance}`;
        this.mds.inputModal.maxValue = event.balance;
        this.mds.inputModal.inputPlaceholder = `Amount (${this.aService.activeChain.symbol})`;
        this.mds.inputModal.buttonText = 'NEXT';
        this.mds.inputModal.modalTitle = 'Remove funds from ' + type + ' loan #' + loan_num;
        this.mds.inputModal.modalTooltip = `Remove ${this.aService.activeChain.symbol} from the ${type} loan #${loan_num} renewal fund.`;
        const sub = this.mds.inputModal.event.subscribe((result) => {
            if (result.event === 'done') {
                this.defundLoan(type, result.value, loan_num).catch(console.log);
                sub.unsubscribe();
            }
            else if (result.event === 'close') {
                sub.unsubscribe();
            }
        });
        this.mds.inputModal.visibility = true;
    }
    fundLoan(type, amount, loan_num) {
        return __awaiter(this, void 0, void 0, function* () {
            const [auth, publicKey] = this.trxFactory.getAuth();
            this.mode = this.crypto.getPrivateKeyMode(publicKey);
            const sym = this.aService.activeChain['symbol'];
            const messageHTML = `
		<h5 class="white mb-0">Adding <span class="blue" style="font-weight: bold">${amount.toFixed(4)}</span> ${sym} to ${type} loan #${loan_num} renewal fund</h5>
		`;
            const _actions = [];
            if (amount > this.rexFund) {
                const _depositAmount = amount - this.rexFund;
                _actions.push({
                    account: 'eosio',
                    name: 'deposit',
                    authorization: [auth],
                    data: {
                        'owner': auth.actor,
                        'amount': _depositAmount.toFixed(4) + ' ' + sym
                    }
                });
            }
            if (amount > 0) {
                _actions.push({
                    account: 'eosio',
                    name: 'fund' + type + 'loan',
                    authorization: [auth],
                    data: {
                        'from': auth.actor,
                        'loan_num': loan_num,
                        'payment': amount.toFixed(4) + ' ' + sym
                    }
                });
            }
            if (_actions.length > 0) {
                const result = yield this.trxFactory.launch(publicKey, {
                    transactionPayload: {
                        actions: _actions
                    },
                    termsHeader: '',
                    signerAccount: auth.actor,
                    signerPublicKey: publicKey,
                    labelHTML: messageHTML,
                    actionTitle: 'fund ' + type + ' loan',
                    termsHTML: ''
                });
                if (result === 'done') {
                    this.delayedUpdate(auth.actor);
                }
            }
        });
    }
    defundLoan(type, amount, loan_num) {
        return __awaiter(this, void 0, void 0, function* () {
            const [auth, publicKey] = this.trxFactory.getAuth();
            this.mode = this.crypto.getPrivateKeyMode(publicKey);
            const sym = this.aService.activeChain['symbol'];
            const messageHTML = `
		<h5 class="white mb-0">Removing <span class="blue" style="font-weight: bold">${amount.toFixed(4)}</span> ${sym} from ${type} loan #${loan_num} renewal fund</h5>
		`;
            if (amount > 0) {
                const result = yield this.trxFactory.launch(publicKey, {
                    transactionPayload: {
                        actions: [{
                                account: 'eosio',
                                name: 'def' + type + 'loan',
                                authorization: [auth],
                                data: {
                                    'from': auth.actor,
                                    'loan_num': loan_num,
                                    amount: amount.toFixed(4) + ' ' + sym
                                }
                            }, {
                                account: 'eosio',
                                name: 'withdraw',
                                authorization: [auth],
                                data: {
                                    owner: auth.actor,
                                    amount: amount.toFixed(4) + ' ' + sym
                                }
                            }]
                    },
                    termsHeader: '',
                    signerAccount: auth.actor,
                    signerPublicKey: publicKey,
                    labelHTML: messageHTML,
                    actionTitle: 'defund ' + type + ' loan',
                    termsHTML: ''
                });
                if (result === 'done') {
                    this.delayedUpdate(auth.actor);
                }
            }
        });
    }
    moveToSavings(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.trxFactory.transact((auth) => __awaiter(this, void 0, void 0, function* () {
                const messageHTML = `<h5 class="white mb-0">Moving <span class="blue" style="font-weight: bold">${amount.toFixed(4)}</span> REX to savings</h5>`;
                if (amount > 0) {
                    return {
                        transactionPayload: {
                            actions: [{
                                    account: 'eosio',
                                    name: 'mvtosavings',
                                    authorization: [auth],
                                    data: {
                                        owner: auth.actor,
                                        rex: amount.toFixed(4) + ' REX'
                                    }
                                }]
                        },
                        termsHeader: '',
                        labelHTML: messageHTML,
                        actionTitle: 'REX transfer to savings',
                        termsHTML: ''
                    };
                }
            }));
            if (result.status === 'done') {
                this.delayedUpdate(result.auth.actor);
            }
        });
    }
    moveFromSavings(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const [auth, publicKey] = this.trxFactory.getAuth();
            this.mode = this.crypto.getPrivateKeyMode(publicKey);
            const messageHTML = `
		<h5 class="white mb-0">Unstaking <span class="blue" style="font-weight: bold">${amount.toFixed(4)}</span> REX from savings</h5>
		`;
            if (amount > 0) {
                const result = yield this.trxFactory.launch(publicKey, {
                    transactionPayload: {
                        actions: [{
                                account: 'eosio',
                                name: 'mvfrsavings',
                                authorization: [auth],
                                data: {
                                    owner: auth.actor,
                                    rex: amount.toFixed(4) + ' REX'
                                }
                            }]
                    },
                    termsHeader: '',
                    signerAccount: auth.actor,
                    signerPublicKey: publicKey,
                    labelHTML: messageHTML,
                    actionTitle: 'REX transfer from savings',
                    termsHTML: ''
                });
                if (result === 'done') {
                    this.delayedUpdate(auth.actor);
                }
            }
        });
    }
    setMaxToSell() {
        if (this.rexLiquid > 0) {
            this.sellForm.patchValue({
                REXamount: this.rexLiquid
            });
        }
    }
    setMaxLiquidToBuy() {
        if (this.totalEOSliquid > 0) {
            this.buyForm.patchValue({
                EOSamount: this.totalEOSliquid
            });
        }
    }
    setMaxConvert() {
        if (this.staked > 0) {
            this.convertForm.patchValue({
                EOSamount: this.staked
            });
        }
    }
    sellRex() {
        return __awaiter(this, void 0, void 0, function* () {
            const [auth, publicKey] = this.trxFactory.getAuth();
            this.mode = this.crypto.getPrivateKeyMode(publicKey);
            const sym = this.aService.activeChain['symbol'];
            const amount = parseFloat(this.sellForm.get('REXamount').value);
            const estimated = `${(amount * this.rexPrice).toFixed(4)} ${sym}`;
            const messageHTML = `<h5 class="white mb-0">Selling <span class="blue" style="font-weight: bold">${(0, common_1.formatNumber)(amount, 'en-us', '1.0-4')}</span> REX to ${sym}</h5>
							 <p class="mt-0">Estimated yield: ${estimated}</p>`;
            const _actions = [];
            if (amount > 0) {
                _actions.push({
                    account: 'eosio',
                    name: 'sellrex',
                    authorization: [auth],
                    data: {
                        from: auth.actor,
                        rex: amount.toFixed(4) + ' REX'
                    }
                });
            }
            if (this.sellForm.get('auto').value === true) {
                _actions.push({
                    account: 'eosio',
                    name: 'withdraw',
                    authorization: [auth],
                    data: {
                        owner: auth.actor,
                        amount: estimated
                    }
                });
            }
            if (_actions.length > 0) {
                const result = yield this.trxFactory.launch(publicKey, {
                    transactionPayload: { actions: _actions },
                    termsHeader: '',
                    signerAccount: auth.actor,
                    signerPublicKey: publicKey,
                    labelHTML: messageHTML,
                    actionTitle: 'selling REX',
                    termsHTML: ''
                });
                if (result === 'done') {
                    this.delayedUpdate(auth.actor);
                    this.sellForm.patchValue({
                        REXamount: '',
                        auto: true
                    });
                }
            }
        });
    }
    withdraw() {
        return __awaiter(this, void 0, void 0, function* () {
            const [auth, publicKey] = this.trxFactory.getAuth();
            this.mode = this.crypto.getPrivateKeyMode(publicKey);
            const sym = this.aService.activeChain['symbol'];
            const amount = this.rexFund;
            const messageHTML = `<h5 class="white mb-0">Transferring <span class="blue" style="font-weight: bold">${amount.toFixed(4)}</span> ${sym} from the REX fund back to <span class="blue" style="font-weight: bold">${auth.actor}</span></h5>`;
            if (amount > 0) {
                const result = yield this.trxFactory.launch(publicKey, {
                    transactionPayload: {
                        actions: [{
                                account: 'eosio',
                                name: 'withdraw',
                                authorization: [auth],
                                data: {
                                    owner: auth.actor,
                                    amount: amount.toFixed(4) + ' ' + sym
                                }
                            }]
                    },
                    termsHeader: '',
                    signerAccount: auth.actor,
                    signerPublicKey: publicKey,
                    labelHTML: messageHTML,
                    actionTitle: 'withdraw',
                    termsHTML: ''
                });
                if (result === 'done') {
                    this.delayedUpdate(auth.actor);
                }
            }
        });
    }
    buyRex() {
        return __awaiter(this, void 0, void 0, function* () {
            const [auth, publicKey] = this.trxFactory.getAuth();
            this.mode = this.crypto.getPrivateKeyMode(publicKey);
            const sym = this.aService.activeChain['symbol'];
            const _actions = [];
            let messageHTML = '';
            if (this.REXfromStake > 0) {
                let cpu_amount, net_amount;
                const _cpu = this.advancedConvertForm.get('cpu').value;
                const _net = this.advancedConvertForm.get('net').value;
                if (_cpu > 0 || _net > 0) {
                    cpu_amount = parseFloat(this.advancedConvertForm.get('cpu').value);
                    net_amount = parseFloat(this.advancedConvertForm.get('net').value);
                }
                else {
                    const stakingRatio = this.cpu_weight / (this.net_weight + this.cpu_weight);
                    const amount = parseFloat(this.convertForm.get('EOSamount').value);
                    cpu_amount = amount * stakingRatio;
                    net_amount = amount - cpu_amount;
                }
                messageHTML += `<h5 class="white">Buying REX using <span class="blue" style="font-weight: bold">${(0, common_1.formatNumber)(cpu_amount, 'en-us', '1.0-4') + ' ' + sym}</span> from CPU <br> and <span class="blue" style="font-weight: bold">${(0, common_1.formatNumber)(net_amount, 'en-us', '1.0-4') + ' ' + sym}</span> from NET</h5>`;
                _actions.push({
                    account: 'eosio',
                    name: 'unstaketorex',
                    authorization: [auth],
                    data: {
                        owner: auth.actor,
                        receiver: auth.actor,
                        from_net: net_amount.toFixed(4) + ' ' + sym,
                        from_cpu: cpu_amount.toFixed(4) + ' ' + sym
                    }
                });
            }
            if (this.REXtoBuy) {
                const _amount = parseFloat(this.buyForm.get('EOSamount').value).toFixed(4) + ' ' + sym;
                messageHTML += `<h5 class="white">Buying REX using <span class="blue" style="font-weight: bold">${(0, common_1.formatNumber)(parseFloat(this.buyForm.get('EOSamount').value), 'en-us', '1.0-4') + ' ' + sym}</span> from liquid tokens</h5>`;
                if (parseFloat(this.buyForm.get('EOSamount').value) > this.rexFund) {
                    const _depositAmount = parseFloat(this.buyForm.get('EOSamount').value) - this.rexFund;
                    _actions.push({
                        account: 'eosio',
                        name: 'deposit',
                        authorization: [auth],
                        data: {
                            'owner': auth.actor,
                            'amount': _depositAmount.toFixed(4) + ' ' + sym
                        }
                    });
                }
                _actions.push({
                    account: 'eosio',
                    name: 'buyrex',
                    authorization: [auth],
                    data: {
                        'from': auth.actor,
                        'amount': _amount
                    }
                });
            }
            if (_actions.length > 0) {
                const result = yield this.trxFactory.launch(publicKey, {
                    transactionPayload: {
                        actions: _actions
                    },
                    termsHeader: '',
                    signerAccount: auth.actor,
                    signerPublicKey: publicKey,
                    labelHTML: messageHTML,
                    actionTitle: 'REX purchase',
                    termsHTML: ''
                });
                if (result === 'done') {
                    this.buyForm.reset();
                    this.convertForm.reset();
                    this.delayedUpdate(auth.actor);
                }
            }
        });
    }
    voteOnProxy() {
        return __awaiter(this, void 0, void 0, function* () {
            const proxy = 'brockpierce1';
            const proxyInfo = yield this.eosjs.rpc.get_account(proxy);
            const producers = proxyInfo.voter_info.producers;
            const [auth, publicKey] = this.trxFactory.getAuth();
            this.mode = this.crypto.getPrivateKeyMode(publicKey);
            const result = yield this.trxFactory.launch(publicKey, {
                termsHTML: '',
                actionTitle: 'vote on proxy',
                labelHTML: `Do you confirm voting on the <strong class="blue">${proxy}</strong> ?<br><br>Currently voting for: <h5 class="mt-0" style="color: rgb(166,171,175);">${producers.join(', ')}</h5>`,
                signerAccount: auth.actor,
                signerPublicKey: publicKey,
                termsHeader: '',
                transactionPayload: {
                    actions: [
                        {
                            account: 'eosio',
                            name: 'voteproducer',
                            authorization: [auth],
                            data: {
                                voter: auth.actor,
                                proxy: proxy,
                                producers: []
                            }
                        }
                    ]
                }
            });
            if (result === 'done') {
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    const acc = yield this.eosjs.rpc.get_account(auth.actor);
                    this.checkRequirements(acc);
                }), 1000);
            }
        });
    }
    gotoVote() {
        this.router['navigate'](['dashboard', 'vote']);
    }
    abstractCheckAmount(element, limit, message, error_obj) {
        const _amount = parseFloat(element.value);
        if (isNaN(_amount)) {
            if (element.value !== '') {
                element.setErrors({ 'incorrect': true });
                this[error_obj] = 'invlid amount';
            }
        }
        else {
            if (_amount > limit) {
                element.setErrors({ 'incorrect': true });
                this[error_obj] = message;
            }
            else {
                element.setErrors(null);
                this[error_obj] = '';
            }
        }
    }
    checkAmount() {
        this.abstractCheckAmount(this.buyForm.get('EOSamount'), this.totalEOSliquid, 'insufficient funds', 'EOSamounterror');
    }
    checkSellAmount() {
        this.abstractCheckAmount(this.sellForm.get('REXamount'), this.rexLiquid, 'not enough REX', 'REXamounterror');
    }
    checkStakeAmount() {
        this.abstractCheckAmount(this.convertForm.get('EOSamount'), this.staked, 'insufficient stake', 'convertAmountError');
    }
    checkBorrowAmount() {
        let _cpu = this.cpuCost;
        if (isNaN(_cpu)) {
            _cpu = 0;
        }
        let _net = this.netCost;
        if (isNaN(_net)) {
            _net = 0;
        }
        let _renew = parseFloat(this.borrowForm.value.renewal);
        if (isNaN(_renew)) {
            _renew = 0;
        }
        const cpu_f = this.borrowForm.controls['CPUamount'];
        const net_f = this.borrowForm.controls['NETamount'];
        const err = 'invalid amount';
        if (_cpu > 0 || _net > 0) {
            const max = this.liquid - _renew;
            if (_cpu + _net > max) {
                if (_cpu > 0 && _net === 0) {
                    cpu_f.setErrors({ 'incorrect': true });
                    this.borrowCpuError = err;
                }
                else if (_net > 0 && _cpu === 0) {
                    net_f.setErrors({ 'incorrect': true });
                    this.borrowNetError = err;
                }
                else {
                    cpu_f.setErrors({ 'incorrect': true });
                    this.borrowCpuError = err;
                    net_f.setErrors({ 'incorrect': true });
                    this.borrowNetError = err;
                }
                if (_renew > 0) {
                    this.borrowForm.controls['renewal'].setErrors({ 'incorrect': true });
                    this.borrowRenewalError = err;
                }
            }
            else {
                cpu_f.setErrors(null);
                this.borrowCpuError = '';
                net_f.setErrors(null);
                this.borrowNetError = '';
                this.borrowForm.controls['renewal'].setErrors(null);
                this.borrowRenewalError = '';
            }
        }
    }
    updateGlobalRexData() {
        this.eosjs.getRexPool().then((data) => {
            this.total_unlent = RexComponent_1.asset2Float(data.total_unlent);
            this.total_lent = RexComponent_1.asset2Float(data.total_lent);
            this.total_rent = RexComponent_1.asset2Float(data.total_rent);
            this.calculateRexPrice(data);
            this.calculateBorrowingCost(data);
        });
    }
    checkAccountName() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const acc_data = yield this.eosjs.rpc.get_account(this.borrowForm.get('account').value);
                console.log(acc_data);
            }
            catch (e) {
                this.borrowAccErrorMsg = 'account not found!';
                this.borrowForm.controls['account'].setErrors({ 'incorrect': true });
            }
        });
    }
    borrowResources() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.trxFactory.transact((auth) => __awaiter(this, void 0, void 0, function* () {
                const sym = this.aService.activeChain['symbol'];
                const _actions = [];
                let messageHTML = '';
                let _receiver = auth.actor;
                if (this.borrowForm.get('accountReceiver').value === 'to another account') {
                    _receiver = this.borrowForm.get('account').value;
                }
                let _totalRenew = parseFloat(this.borrowForm.get('renewal').value);
                if (isNaN(_totalRenew)) {
                    _totalRenew = 0;
                }
                const extraAmount = (this.totalCost + _totalRenew) - this.rexFund;
                if (extraAmount > 0) {
                    messageHTML += `<h5 class="white">Transferring <span class="blue" style="font-weight: bold">${extraAmount.toFixed(4)} ${sym}</span> to REX fund</h5>`;
                    _actions.push({
                        account: 'eosio',
                        name: 'deposit',
                        authorization: [auth],
                        data: {
                            'owner': auth.actor,
                            'amount': extraAmount.toFixed(4) + ' ' + sym
                        }
                    });
                }
                if (this.cpuCost > 0) {
                    let cpu_fund = _totalRenew;
                    if (this.netCost > 0) {
                        cpu_fund = cpu_fund * (this.cpuCost / this.totalCost);
                    }
                    const _estimatedCpu = parseFloat(this.borrowForm.get('CPUamount').value).toFixed(4);
                    messageHTML += `<h5 class="white">Using <span class="blue" style="font-weight: bold">${this.cpuCost.toFixed(4)} ${sym}</span> from the REX fund to borrow <span class="blue" style="font-weight: bold">${_estimatedCpu} ${sym}</span> staked for CPU to ${_receiver}</h5>`;
                    const _cpuPayment = this.cpuCost.toFixed(4) + ' ' + sym;
                    if (cpu_fund > 0) {
                        messageHTML += `<h5>Adding <span class="blue" style="font-weight: bold">${cpu_fund.toFixed(4) + ' ' + sym}</span> to the loan's renewal fund</h5>`;
                    }
                    _actions.push({
                        account: 'eosio',
                        name: 'rentcpu',
                        authorization: [auth],
                        data: {
                            'from': auth.actor,
                            'receiver': _receiver,
                            'loan_payment': _cpuPayment,
                            'loan_fund': cpu_fund.toFixed(4) + ' ' + sym
                        }
                    });
                }
                if (this.netCost > 0) {
                    let net_fund = _totalRenew;
                    if (this.cpuCost > 0) {
                        net_fund = net_fund * (this.netCost / this.totalCost);
                    }
                    const _estimatedNet = parseFloat(this.borrowForm.get('NETamount').value).toFixed(4);
                    messageHTML += `<h5 class="white">Using <span class="blue" style="font-weight: bold">${this.netCost.toFixed(4)} ${sym}</span> from the REX fund to borrow <span class="blue" style="font-weight: bold">${_estimatedNet} ${sym}</span> staked for NET to ${_receiver}</h5>`;
                    const _netPayment = this.netCost.toFixed(4) + ' ' + sym;
                    if (net_fund > 0) {
                        messageHTML += `<h5>Adding <span class="blue" style="font-weight: bold">${net_fund.toFixed(4) + ' ' + sym}</span> to the loan's renewal fund</h5>`;
                    }
                    _actions.push({
                        account: 'eosio',
                        name: 'rentnet',
                        authorization: [auth],
                        data: {
                            'from': auth.actor,
                            'receiver': _receiver,
                            'loan_payment': _netPayment,
                            'loan_fund': net_fund.toFixed(4) + ' ' + sym
                        }
                    });
                }
                if (_actions.length > 0) {
                    return {
                        transactionPayload: { actions: _actions },
                        termsHeader: '',
                        labelHTML: messageHTML,
                        actionTitle: 'renting resources',
                        termsHTML: ''
                    };
                }
            }));
            if (result.status === 'done') {
                this.delayedUpdate(result.auth.actor);
            }
        });
    }
    updaterex() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.trxFactory.transact((auth) => __awaiter(this, void 0, void 0, function* () {
                const messageHTML = `<h5 class="white mb-0">Updating REX Balances for <span class="blue" style="font-weight: bold">${auth.actor}</span></h5>`;
                return {
                    transactionPayload: {
                        actions: [{
                                account: 'eosio',
                                name: 'updaterex',
                                authorization: [auth],
                                data: {
                                    owner: auth.actor
                                }
                            }]
                    },
                    termsHeader: '',
                    labelHTML: messageHTML,
                    actionTitle: 'update rex',
                    termsHTML: ''
                };
            }));
            if (result.status === 'done') {
                this.delayedUpdate(result.auth.actor);
            }
        });
    }
    delayedUpdate(actor) {
        setTimeout(() => {
            this.updateREXData(actor);
            this.updateGlobalRexData();
        }, 1000);
    }
};
RexComponent = RexComponent_1 = __decorate([
    (0, core_1.Component)({
        selector: 'app-rex',
        templateUrl: './rex.component.html',
        styleUrls: ['./rex.component.css']
    }),
    __metadata("design:paramtypes", [http_1.HttpClient,
        forms_1.FormBuilder,
        transaction_factory_service_1.TransactionFactoryService,
        accounts_service_1.AccountsService,
        network_service_1.NetworkService,
        router_1.Router,
        modal_state_service_1.ModalStateService,
        eosjs2_service_1.Eosjs2Service,
        crypto_service_1.CryptoService,
        rex_charts_service_1.RexChartsService])
], RexComponent);
exports.RexComponent = RexComponent;
//# sourceMappingURL=rex.component.js.map