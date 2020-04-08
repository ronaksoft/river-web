/*
    Creation Time: 2018 - Sep - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {C_ERR, C_ERR_ITEM, C_MSG, C_MSG_NAME} from '../const';
import Presenter from '../presenters';
import UpdateManager from './../updateManager';
import {Error as RiverError, InputPassword, MessageContainer, MessageEnvelope} from '../messages/chat.core.types_pb';
import {throttle, cloneDeep} from 'lodash';
import Socket from './socket';
import {base64ToU8a, uint8ToBase64} from '../fileManager/http/utils';
import MainRepo from "../../../repository";
import MessageRepo from "../../../repository/message";

const C_IDLE_TIME = 300;
const C_TIMEOUT = 20000;
export const C_RETRY = 3;

interface IErrorPair {
    code: string;
    items: string;
}

interface IRequestOptions {
    retry?: number;
    retryErrors?: IErrorPair[];
    retryWait?: number;
    timeout?: number;
}

export interface IServerRequest {
    constructor: number;
    data: Uint8Array;
    options?: IRequestOptions;
    reqId: number;
    retry: number;
    timeout: any;
}

export let serverKeys = `{"PublicKeys":[{"N":"20913223291527889119233489543906055280112509837587412661185920982237593240496621500246053217858650595488144806523401311528331511139252992855856813518497345344505399590363098661619422237284569106222214983121751303492636475445822018976936935004401602072312243314703942516120757238112686341093127753824993064279076257400574901873895078238314785888553089377070115461172373645253008887735180896472736642787127163985872009659554037832460691492308190061694931739102807895343609962750635334989849450478711810862430628358082816584190988339977461445911946142568113216063217954322553823203070174207897269755515928523084112873059","FingerPrint":5256827074095888927,"E":65537},{"N":"24601449109580800263575602719244220556844193972049411651243730611389642618789047193926765301420730235177708097487478276488676767866707806309988193525467657429453842509078430273826606510090990961015162218852663801640149694670873723530501191058425287452058581276342677903227618502302416571735716126606543778053856300081239503692274729372588074998105421604488386311327855031432779587679698508839165950747244378663186162462011360523558875495798239128637275903817138635858725314288117979005920359895539886782742831597388635615409600670231307375667388870799288823978759941816924424318598135820259093146459531531401987093371","FingerPrint":-3665080486746452985,"E":65537},{"N":"29037519206988095580349654044478080201468409306610249511158808722752195155795675154256160446114502258018735893500285501729113073584719490961728514529419096641168539303311022932388418345950560595643927705408466738651200049154464615717104037007926018184169286423472696378163988841412520775848138953171726039989784209314019029790406390988514780170851826599818729128080694537728808006688674712150769051804152045583446333938512979371454314679391320136812775434013731252387310491344166706757858271915461527688430048501940920226401681827518871908803537920342486095752075317165293207881325612277560970691252306287435109281437","FingerPrint":-5727904056408655091,"E":65537},{"N":"28404130232388988488012777944232278940771307026632764820200131292098369603247395396567150607975227873383261999432854390138612954791103320892121549025367781413583040768563139918578259416765680341441704574509421175788363641873783641882636245915165316465219546462797753314265383330236554371991421294763701117179530239331169824263304408082747862857578593946497331661906980680067560311006333109210930149955619451273813899285200288868512635418936418440831097051707587254144072133971213715893541979414857123752866113078500927925670858787526463052194236923234763595024284008141088895232619667951944370994316436085190999560873","FingerPrint":-4814393832045667970,"E":65537},{"N":"26873652173215910883420051230852226436491711609304648960374622866005972818191288385080472275095712137114669236706193912593465833734733555262974764408928300517376866667044747253370789896917293623090152158910625182874548926628681594355682169758762210538752197223506019447574307639630871660179586148544498817270440351178907033535815824911589249071963507622464550899630926663244468596707529957349392189547595412510626076348354663860273779205426878314053261642036135204781631603534077686043334105267827295434839461290385561208473162397060069074468796232085731685283340968637238286255453412905793421688931347830482397069557","FingerPrint":7329014239262238678,"E":65537},{"N":"25045304905763257078593908603619944991885603122991755491806249011377090555499696265611869693598056591729697235897618411818891942535244785676965847639990168012440245304575106425060851163625751816921480507216804249940329207489804416184574667043299260576823630324189559238880090883225404385875961341298670731489948631847718120461247251329462414313604441068382209529600132861323718291464684313850959979220909823760505393201505352668470857762717814368963865552842088148331252114564678339812094050334456949082215875662305409532242082927442304953850266256779114927648964818253273833528141899133017138923495373012296868655041","FingerPrint":-4918162796432996034,"E":65537},{"N":"23988352755389935512710903058627475663817182552105146554597976692161334023530131456793398242223865771435628963041513559505660437011932820218839549968723223891487071281293876068728718569948239908966490745590432810571755535921322325757805600319414650295192149230185249995154281336677472121658932479252452420612890755723842431920618303492199791045382922555224151248398603475627032014622427661967114819432186181958657972738432888273700490847535417110396797689811455025906621911795306595093746079079276433210274435985224949455468572759277344550530023542739021029003737667573332748022022776568195936335085539919207696753783","FingerPrint":2980004172648781480,"E":65537},{"N":"31022263347361152212178141820157968380691586491335529787121552589013923981655845826579570217132315613050144299233045785299481779402603249073727857868819287200470761887174779655309422910123478492103898554762034746615000602684478227380994645443035390385267787496497095678777756487880929019126914845352698853630354052858995507814341573593250024742249345189935266037517152363680030807149978096968087915710295175986583405341924844589211536487627091925651762842717297247470653414717589809460440972723621737411514997089767017696535816644167447556036698611916794590907018122471162761140425118476939484871782461877970705308753","FingerPrint":-1597472268099396404,"E":65537},{"N":"24204374603469954649672813598097946701591817801869695689812525206047244383392301156546375699412338406877341712089464721136715284171422816960672651225517438227272615815879585235466539490983192668769815192500780546764648136373192528179360336578088524149271225565182996356612042293197448432350670415315013606247392491261310334937381819334772753706450883678015565289916662187331049776677869880302965215208667666614772758408195675723269973113811161316891247146598231034430944786157622040339982894900079084792247129955140229025656149560696072186807352727137673824477491403179788800066515710737173151360985018971811489794127","FingerPrint":4875397198518569092,"E":65537},{"N":"23814179129899578331606582753299355656144165930230153287968180406935422402339782584965705387291154079833896394048874703006933143489652617160965756609437715497485614801832089026042094793784857449772712750743093960687042673347600086217056540788593785204999756034833560042602126265101375138189012194078643356567630028962699299543443933340055385105166332199098957854569691541990706770809474459860402392568059952579127858050013807926089794400884216192576282944829088336715183373675683752872702807487728270058665775478390723824975889628133674446177320392635524506285706408722653845688201085308189782196101117019501183135439","FingerPrint":6116049530954070209,"E":65537}],"DHGroups":[{"Prime":"FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF","Gen":2,"FingerPrint":-4978776997167059722}]}`;
const workspace = (localStorage.getItem('river.workspace_url') || '');
if (workspace.indexOf('ronaksoftware.com') > -1 || workspace.indexOf('localhost') > -1 || (workspace === '' && window.location.host.indexOf('ronaksoftware.com') > -1)) {
    serverKeys = `{"PublicKeys":[{"N":"25118848897932282177245700919139384404750150099443051286420483958680932318999616785468117358656906868745535067114368253583642867447644069742034871690887327807641806393154362866814670869067082838910855582042571344627633847312858985989376011283293406446259224113424892885526467096873630090982411366060309228545939134187830467758087915442541333526473506224183662758369346162982899850891065845576237266688752908504452157782224543297742005937283247646798191769066825742717116948044645985042083938549757785369721749659525202291409273477753359658898944013607000873216784148319330165950486883420334054833644032847855482032509","FingerPrint":7394918641852592645,"E":65537},{"N":"21249707023259589828882625203572225674272580290693121144039064585772886999841963721536409526022282440843688128262657540061767032187088787519653928724034793475849047994789250487935742236267848935158291781289935130264092548463720489626032599455872076196089874292697176233901232972584747422218633150431148606115133786415925258966498648297190127103542990365765167875712382655400672904401808039905581013143219877381673335013417196709050371628383130063205039714231505438906188340348457944648916217683298881611185125570182541993037806056563338841286324689864878852103314733737724967696722326127563991449350826172408373703811","FingerPrint":2363776248257911173,"E":65537},{"N":"19863054550604193823488041727574907794553354963467193076917818924664132721754826665850220231906962083775008201369133561957397980133889912558248851951970519776044765817502621009587064784777693096628382835779877029866758294196797090656332977683146622524047322377443516436601239695252843413905686699399020467544689455363457822624449365145949732364643029028423685551893583641819962002723393831006146669077949073237542941080523176298527840258778842205532339989739100238320204236098210328490552190436163372996242056017356783361778247846127669138796572298996264305675423638602261670710374605191817283295227384113688431647741","FingerPrint":-5099141843327820626,"E":65537},{"N":"29760428901343664001028833309809794343544015677516397170674878601215588275791808212890742556162155895595827561470784507818927441382831252170628521332528557087987520295267196790927612592611029658149082172703008759671157419031039827342837361544291472718895472521013019716259483209354020921442127452371575891423820946699295605756004551833001279075974074080563224444666224932026454045362404382286378528513546737731664019469325785485757138817241905803574388304564238374420073230240484847573015947946433863321363117973803262320677243592635383550602155520291663476434998507275737426553598472331105536846460631682739989661219","FingerPrint":2195174703119182464,"E":65537},{"N":"18386064557489952286420347590296751434578282707405869816885958713299461000323959947566645042552856526031409640177153580413557456444169596581870998341797298680104080669684015732452983077686038078494582573312218274626467111808818429778886097765709133950743171507322894959330274463277504523606073120382446662040167960142274463155227517163276212205755835422067514615854827329645266346012533996475215453580382748104598835874268054865686479895544554797198146708876762174829892817477539609356506735917106650744544665071969880523400678780093929701726905569602897801522055926413967804403930759100613510462652269603976775523991","FingerPrint":4479840379683382772,"E":65537},{"N":"26856167804545448049290579564011023468588993763008293592188466181493624152203964999095367371420795128612430412472216110838073483063451607435345678606377899388181953712712568128395316210032734586003021350117744410467197964162932002685114458972873577239300798020981277258362899408637644884906090479440297628771615765991411446325782942661223836610577955450204097820932873841360326076035286707297809053813347011465715499268402698830927150083994456520884686861897089801285632944182913126283200633552976218386749841394603856739318115312415688232906365260846416122082293147230082963151578228644118548380817922335519702098503","FingerPrint":8569728225196202638,"E":65537},{"N":"25761140930539439978494783846660734379198950078321693758033663237052334640619530471139381746103855925800702484276297098648531198741474154475735948656994497481651905678934562912991440112672560383261093402078501161430697511324735371368031617819168590943786234823019615023005756998056375397284879696822974650961011580206091499395498399390492214337547240343451565823803753121080531070054153784629505452057439601601659807136850041526794231441222954424268629610149685990628010782230767695141965499949849652822543965784952473307155505095483489743547945382166911358040409429285318638614625039958145755691598575103601662635873","FingerPrint":-3518366518126294391,"E":65537},{"N":"21878729227264443273397917465852122220894317740032779776997968051790123215989999965841007199864479838712294015929085122553441217024812487754107081810828692874014089314153826066240729740923792526876590678500745479627405100598576824756706391682294987326965673261452172826182988573765370466024746236316548372296498943339682423467178382713458130758590318962795115037395346029561258543522802194745122834923204527595669724518557927046350328890508977160087250218063301295330767720877139867168393712617902052319906711468238632536228153728846644967777470083076472892276635992022186751494397742523839928248454129614564991083729","FingerPrint":2842355922125748985,"E":65537},{"N":"21657921575259117082437287735038824160972581974539609548491823065113660182941223450746616405735767608349485813933217527787805175774080112057626391016872155067405926907423276805486934732269185402251726464897721288759735238594916980944505711016119900765546002533418456991149932694983775618316688113269913087592812309102853747522924306054009231759094013878121201675566877636823973567095580198874586722886709122615656758634448002677386356379713382005231679191964292977504291853536019601586206944266621069762821758456214432463931452218289861680478993171959176435089862340125449068198909635604459895897355597575325195619933","FingerPrint":-3702519902476465341,"E":65537},{"N":"26560773297321496796638749735111859220513359531489936481661136779884784205625113812180402394116732738755028273755313585352103067809685809119858624584482833675871489309402205980675382020337358851404166618802304410342906475560595604118840081050808937188565007332779418031411195462315469094720417421137008865029869517973582341668257878628972653824064257107524501253937531889165608386214524613639093523758099418212998287757704077924182163275085135477703526566976609275979665583622386423029286172254415496073164236409043934726212766525195423766504808027467773836621258239588220853730478580185244315599773665364850566951753","FingerPrint":-2599890069662518803,"E":65537}],"DHGroups":[{"Prime":"FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF","Gen":2,"FingerPrint":-4978776997167059722}]}`;
}
const sk = localStorage.getItem('river.server_keys');
if (sk && sk.length > 10) {
    serverKeys = sk;
}

export default class Server {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new Server();
        }

        return this.instance;
    }

    private static instance: Server;

    private socket: Socket;
    private reqId: number;
    private messageListeners: object = {};
    private serviceMessagesListeners: object = {};
    private sentQueue: number[] = [];
    private updateQueue: any[] = [];
    private readonly updateManager: UpdateManager | undefined;
    private isConnected: boolean = false;
    private requestQueue: MessageEnvelope[] = [];
    private readonly executeSendThrottledRequestThrottle: any;
    private lastActivityTime: number = 0;
    private cancelList: number[] = [];
    private updateInterval: any = null;

    public constructor() {
        this.socket = Socket.getInstance();
        this.reqId = 0;
        this.getLastActivityTime();
        this.startIdleCheck();
        const version = this.shouldMigrate();
        if (version !== false) {
            this.migrate(version);
            return;
        } else {
            this.socket.setCallback((data: any) => {
                this.response(data);
            });

            this.socket.setUpdate((data: any) => {
                this.update(data);
            });

            this.socket.setError((data: any) => {
                this.error(data);
            });

            this.socket.setResolveGenSrpHashFn(this.genSrpHashResolve);

            this.socket.setResolveGenInputPasswordFn(this.genInputPasswordResolve);

            window.addEventListener('wsOpen', () => {
                this.isConnected = true;
                this.flushSentQueue();
                this.executeSendThrottledRequestThrottle();
            });

            window.addEventListener('wsClose', () => {
                this.isConnected = false;
            });

            this.updateManager = UpdateManager.getInstance();
            let throttleInterval = 128;
            const tils = localStorage.getItem('river.debug.throttle_interval');
            if (tils) {
                throttleInterval = parseInt(tils, 10);
            }
            this.executeSendThrottledRequestThrottle = throttle(this.executeSendThrottledRequest, throttleInterval);
        }
    }

    /* Send a request to WASM worker over CustomEvent in window object */
    public send(constructor: number, data: Uint8Array, instant: boolean, options?: IRequestOptions, reqIdFn?: (rId: number) => void): Promise<any> {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;
        if (reqIdFn) {
            reqIdFn(reqId);
        }
        // retry on E00 Server error
        if (!options) {
            options = {
                retry: 3,
                retryErrors: [{
                    code: C_ERR.ErrCodeInternal,
                    items: C_ERR_ITEM.ErrItemServer,
                }],
            };
        } else {
            if (options.retryErrors) {
                if (!options.retryErrors.find(o => o.code === C_ERR.ErrCodeInternal && o.items === C_ERR_ITEM.ErrItemServer)) {
                    options.retryErrors.push({
                        code: C_ERR.ErrCodeInternal,
                        items: C_ERR_ITEM.ErrItemServer,
                    });
                }
            }
        }
        const request: IServerRequest = {
            constructor,
            data,
            options,
            reqId,
            retry: 0,
            timeout: null,
        };

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
            if (this.isConnected) {
                if (instant) {
                    this.sendRequest(request);
                } else {
                    this.sendThrottledRequest(request);
                }
            }
        });

        /* Add request to the queue manager */
        this.messageListeners[reqId] = {
            reject: internalReject,
            request,
            resolve: internalResolve,
            state: 0,
        };

        this.sentQueue.push(reqId);

        return promise;
    }

    public genSrpHash(password: string, algorithm: number, algorithmData: Uint8Array) {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;

        const promise = new Promise<Uint8Array>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.serviceMessagesListeners[reqId] = {
            reject: internalReject,
            resolve: internalResolve,
        };

        // @ts-ignore
        const encoder = new TextEncoder("utf-8");

        this.socket.fnGenSrpHash({
            algorithm,
            algorithmData: uint8ToBase64(algorithmData),
            pass: uint8ToBase64(encoder.encode(password)),
            reqId,
        });

        return promise;
    }

    public genInputPassword(password: string, accountPass: Uint8Array) {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;

        const promise = new Promise<InputPassword>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.serviceMessagesListeners[reqId] = {
            reject: internalReject,
            resolve: internalResolve,
        };

        // @ts-ignore
        const encoder = new TextEncoder("utf-8");

        this.socket.fnGenInputPassword({
            accountPass: uint8ToBase64(accountPass),
            pass: uint8ToBase64(encoder.encode(password)),
            reqId,
        });

        return promise;
    }

    public startNetwork() {
        this.socket.start();
    }

    public stopNetwork() {
        this.socket.stop();
    }

    public isStarted() {
        return this.socket.isStarted();
    }

    public cancelReqId(id: number) {
        if (this.cancelList.indexOf(id) === -1) {
            this.cancelList.push(id);
        }
    }

    private cancelRequestByEnvelope(envelope: MessageEnvelope) {
        // @ts-ignore
        this.cancelRequest({constructor: envelope.getConstructor() || 0, reqId: envelope.getRequestid() || 0});
    }

    private cancelRequest(request: IServerRequest) {
        const index = this.cancelList.indexOf(request.reqId);
        if (index > -1) {
            this.cancelList.splice(index, 1);
            delete this.messageListeners[request.reqId];
            window.console.debug(`%c${C_MSG_NAME[request.constructor]} ${request.reqId} cancelled`, 'color: #cc0000');
            return true;
        }
        return false;
    }

    /* Generate string from request and send to the api */
    private sendRequest(request: IServerRequest) {
        if (this.cancelList.length > 0) {
            if (this.cancelRequest(request)) {
                return;
            }
        }
        window.console.debug(`%c${C_MSG_NAME[request.constructor]} ${request.reqId}`, 'color: #f9d71c');
        request.timeout = setTimeout(() => {
            this.dispatchTimeout(request.reqId);
        }, request.options ? (request.options.timeout || C_TIMEOUT) : C_TIMEOUT);
        this.socket.send(request);
    }

    private sendThrottledRequest(request: IServerRequest) {
        window.console.debug(`%c${C_MSG_NAME[request.constructor]} ${request.reqId}`, 'color: #f9d74e');
        request.timeout = setTimeout(() => {
            this.dispatchTimeout(request.reqId);
        }, request.options ? (request.options.timeout || C_TIMEOUT) : C_TIMEOUT);
        const data = new MessageEnvelope();
        data.setConstructor(request.constructor);
        data.setMessage(request.data);
        data.setRequestid(request.reqId);
        this.requestQueue.push(data);
        this.executeSendThrottledRequestThrottle();
    }

    private executeSendThrottledRequest = () => {
        if (!this.isConnected) {
            return;
        }
        const execute = (envs: MessageEnvelope[]) => {
            if (envs.length === 0) {
                return;
            }
            const reqId = ++this.reqId;
            const data = new MessageContainer();
            data.setEnvelopesList(envs);
            data.setLength(envs.length);

            this.socket.send({
                constructor: C_MSG.MessageContainer,
                data: data.serializeBinary(),
                reqId,
                retry: 0,
                timeout: null,
            });
        };
        let envelopes: MessageEnvelope[] = [];
        while (this.requestQueue.length > 0) {
            const envelope = this.requestQueue.shift();
            if (envelope) {
                if (this.cancelList.length > 0) {
                    this.cancelRequestByEnvelope(envelope);
                } else {
                    envelopes.push(envelope);
                }
            }
            if (envelopes.length >= 50) {
                execute(envelopes);
                envelopes = [];
            }
        }
        execute(envelopes);
    }

    private response({reqId, constructor, data}: any) {
        this.getLastActivityTime();
        if (constructor !== C_MSG.Error) {
            window.console.debug(`%c${C_MSG_NAME[constructor]} ${reqId}`, 'color: #f967a0');
        }
        if (!this.messageListeners[reqId]) {
            return;
        }
        const res = Presenter.getMessage(constructor, base64ToU8a(data));
        if (constructor === C_MSG.Error) {
            window.console.error(C_MSG_NAME[constructor], reqId, res.toObject());
        }
        if (res) {
            if (constructor === C_MSG.Error) {
                const resData = res.toObject();
                if (this.checkRetry(reqId, resData)) {
                    if (this.messageListeners[reqId].reject) {
                        let isLogout = false;
                        if (this.messageListeners[reqId] && this.messageListeners[reqId].request && this.messageListeners[reqId].request.constructor === C_MSG.AuthLogout) {
                            isLogout = true;
                        }
                        if (resData.code === C_ERR.ErrCodeUnavailable && resData.items === C_ERR_ITEM.ErrItemUserID && !isLogout) {
                            if (this.updateManager) {
                                this.updateManager.forceLogOut();
                            }
                        } else {
                            this.messageListeners[reqId].reject(resData);
                        }
                    }
                }
            } else if (constructor === C_MSG.UpdateDifference) {
                if (this.messageListeners[reqId].resolve) {
                    this.messageListeners[reqId].resolve(res);
                }
            } else {
                if (this.messageListeners[reqId].resolve) {
                    if (constructor === C_MSG.AccountPassword) {
                        this.messageListeners[reqId].resolve(res);
                    } else {
                        this.messageListeners[reqId].resolve(res.toObject());
                    }
                }
            }
            clearTimeout(this.messageListeners[reqId].request.timeout);
            this.cleanQueue(reqId);
        }
    }

    private error({reqId, constructor, data}: any) {
        window.console.debug(`%c${C_MSG_NAME[constructor]} ${reqId}`, 'color: #f9d71c');
        const res = Presenter.getMessage(constructor, base64ToU8a(data));
        if (res) {
            if (constructor === C_MSG.Error) {
                const resp = res.toObject();
                if (resp.code === C_ERR.ErrCodeInvalid && resp.items === C_ERR_ITEM.ErrItemAuth) {
                    const authErrorEvent = new CustomEvent('authErrorEvent', {});
                    window.dispatchEvent(authErrorEvent);
                }
            }
        }
    }

    private flushSentQueue() {
        this.sentQueue.forEach((reqId) => {
            this.sendRequest(this.messageListeners[reqId].request);
        });
    }

    private dispatchTimeout(reqId: number) {
        const item = this.messageListeners[reqId];
        if (!item) {
            return;
        }
        window.console.warn('sdk timeout', reqId, C_MSG_NAME[item.request.constructor]);
        if (this.checkRetry(reqId, {
            code: C_ERR.ErrCodeInternal,
            items: C_ERR_ITEM.ErrItemTimeout,
        })) {
            if (item.reject) {
                const name = C_MSG_NAME[item.request.constructor];
                item.reject({
                    constructor: name,
                    err: 'timeout',
                    reqId,
                });
            }
        }
        this.cleanQueue(reqId);
    }

    private cleanQueue(reqId: number) {
        delete this.messageListeners[reqId];
        const index = this.sentQueue.indexOf(reqId);
        if (index > -1) {
            this.sentQueue.splice(index, 1);
        }
    }

    private update(bytes: any) {
        this.getLastActivityTime();
        this.updateQueue.push(bytes);
        this.updateThrottler();
    }

    private updateThrottler() {
        this.dispatchUpdate();
        if (!this.updateInterval) {
            this.updateInterval = setInterval(() => {
                this.dispatchUpdate();
            }, 5);
        }
    }

    private dispatchUpdate() {
        if (this.updateQueue.length > 0 && this.updateManager) {
            this.updateManager.parseUpdate(this.updateQueue.shift());
        } else {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    private shouldMigrate() {
        const v = localStorage.getItem('river.version');
        if (v === null) {
            localStorage.setItem('river.version', JSON.stringify({
                v: 4,
            }));
            return 4;
        }
        const pv = JSON.parse(v);
        switch (pv.v) {
            default:
            case 0:
            case 1:
            case 2:
            case 3:
                return pv.v;
            case 4:
                return false;
        }
    }

    private migrate(v: number | null) {
        switch (v) {
            default:
            case 0:
                this.migrate1();
                return;
            case 1:
            case 2:
                this.migrate2();
                return;
            case 3:
                this.migrate3();
                return;
        }
    }

    private migrate1() {
        // @ts-ignore
        for (const key in localStorage) {
            if (key.indexOf('_pouch_') === 0) {
                indexedDB.deleteDatabase(key);
                localStorage.removeItem(key);
            }
        }
        localStorage.setItem('river.last_update_id', JSON.stringify({
            lastId: 0,
        }));
        localStorage.setItem('river.version', JSON.stringify({
            v: 1,
        }));

        setTimeout(() => {
            this.migrate(1);
        }, 1000);
    }

    private migrate2() {
        if (this.updateManager) {
            this.updateManager.disableLiveUpdate();
        }
        setTimeout(() => {
            MainRepo.getInstance().destroyDB().then(() => {
                localStorage.removeItem('river.last_update_id');
                localStorage.setItem('river.version', JSON.stringify({
                    v: 3,
                }));
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            });
        }, 1000);
    }

    private migrate3() {
        setTimeout(() => {
            const messageRepo = MessageRepo.getInstance();
            messageRepo.getAllTemps().then((msgs) => {
                msgs.map((msg) => {
                    msg.temp = false;
                    return msg;
                });
                const promises: any[] = [];
                promises.push(messageRepo.upsert(msgs));
                promises.push(messageRepo.insertDiscrete(msgs));
                Promise.all(promises).then(() => {
                    localStorage.setItem('river.version', JSON.stringify({
                        v: 4,
                    }));
                    window.location.reload();
                });
            });
        }, 100);
    }

    private getTime() {
        return Math.floor(Date.now() / 1000);
    }

    private startIdleCheck() {
        setInterval(() => {
            if (!this.socket.isOnline()) {
                return;
            }
            const now = this.getTime();
            if (now - this.lastActivityTime > C_IDLE_TIME) {
                this.lastActivityTime = now;
                if (this.updateManager) {
                    this.updateManager.idleHandler();
                }
            }
        }, 10000);
    }

    private getLastActivityTime() {
        this.lastActivityTime = this.getTime();
    }

    private checkRetry(id: number, error: RiverError.AsObject) {
        if (!this.messageListeners[id]) {
            return true;
        }

        const req: IServerRequest = this.messageListeners[id].request;
        if (!req) {
            return true;
        }

        if (!req.options || !req.options.retryErrors || (req.options.retry || C_RETRY) <= req.retry) {
            return true;
        }

        const check = req.options.retryErrors.some((err) => {
            return error.code === err.code && error.items === err.items;
        });
        if (!check) {
            return true;
        }

        const msg = this.messageListeners[id];
        const reqId = ++this.reqId;
        const request: IServerRequest = cloneDeep(req);
        request.reqId = reqId;
        request.retry++;
        request.timeout = null;

        if (this.isConnected) {
            setTimeout(() => {
                this.sendRequest(request);
            }, req.options.retryWait || 0);
        }

        /* Add request to the queue manager */
        this.messageListeners[reqId] = {
            reject: msg.reject,
            request,
            resolve: msg.resolve,
            state: 0,
        };

        this.sentQueue.push(reqId);

        return false;
    }

    private genSrpHashResolve = (reqId: number, data: string) => {
        if (!this.serviceMessagesListeners[reqId]) {
            return;
        }
        const req = this.serviceMessagesListeners[reqId];
        if (req && req.resolve) {
            req.resolve(base64ToU8a(data));
        }
    }

    private genInputPasswordResolve = (reqId: number, data: string) => {
        if (!this.serviceMessagesListeners[reqId]) {
            return;
        }
        const req = this.serviceMessagesListeners[reqId];
        if (req && req.resolve) {
            req.resolve(InputPassword.deserializeBinary(base64ToU8a(data)));
        }
    }
}
