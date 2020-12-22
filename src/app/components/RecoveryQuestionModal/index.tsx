/*
    Creation Time: 2020 - Feb - 01
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import SettingsModal from '../SettingsModal';
import {SyncAltRounded} from '@material-ui/icons';
import i18n from '../../services/i18n';
import Button from '@material-ui/core/Button';
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import TextField from "@material-ui/core/TextField/TextField";
import Select from "@material-ui/core/Select/Select";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import {SecurityQuestion} from "../../services/sdk/messages/accounts_pb";

import './style.scss';

interface IQuestionOption {
    label: string;
    value: number;
}

interface IProps {
    onClose?: () => void;
    onError?: (message: string) => void;
    onDone: (list: SecurityQuestion.AsObject[]) => void;
}

interface IState {
    answer: boolean;
    open: boolean;
    questions: SecurityQuestion.AsObject[];
}

export const questionOptions: IQuestionOption[] = [];

class RecoveryQuestionModal extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            answer: false,
            open: false,
            questions: [{
                answer: '',
                id: -1,
                text: '',
            }, {
                answer: '',
                id: -1,
                text: '',
            }, {
                answer: '',
                id: -1,
                text: '',
            }],
        };

        if (questionOptions.length === 0) {
            for (let i = 0; i < 10; i++) {
                questionOptions.push({
                    label: i18n.t(`settings.recovery.q${i + 1}`),
                    value: i,
                });
            }
        }
    }

    public openDialog(questions: SecurityQuestion.AsObject[], answer?: boolean) {
        if (questions.length === 3) {
            this.setState({
                answer: answer || false,
                open: true,
                questions,
            });
        } else {
            this.setState({
                answer: answer || false,
                open: true,
                questions: [{
                    answer: '',
                    id: -1,
                    text: '',
                }, {
                    answer: '',
                    id: -1,
                    text: '',
                }, {
                    answer: '',
                    id: -1,
                    text: '',
                }],
            });
        }
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        const {open, questions, answer} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('settings.recovery.recovery_options')}
                           icon={<SyncAltRounded/>}
                           onClose={this.modalCloseHandler}
                           height={answer ? '420px' : '580px'}
                           noScrollbar={true}
            >
                <div className="recovery-dialog">
                    {!answer && <div className="recovery-header">
                        {i18n.t('settings.recovery.security_questions')}
                    </div>}
                    {!answer && <div className="recovery-text">
                        {i18n.t('settings.recovery.security_questions_text')}
                    </div>}
                    {questions.map((question, index) => {
                        return (<React.Fragment key={index}>
                            <div className="recovery-header">
                                {index === 0 && i18n.t('settings.recovery.first_question')}
                                {index === 1 && i18n.t('settings.recovery.second_question')}
                                {index === 2 && i18n.t('settings.recovery.third_question')}
                            </div>
                            {answer ? <div className="recovery-text">
                                {questionOptions[(question.id || 0)].label}
                            </div> : <div className="recovery-input">
                                <Select
                                    value={question.id}
                                    onChange={this.questionChangeHandler(index)}
                                    margin="dense"
                                    variant="outlined"
                                    fullWidth={true}
                                    classes={{
                                        select: 'recovery-input-select',
                                    }}
                                >
                                    <MenuItem value={-1}>
                                        <em>{i18n.t('general.none')}</em>
                                    </MenuItem>
                                    {questionOptions.filter(o => {
                                        let filter = true;
                                        questions.forEach((q, i) => {
                                            if (q.id === o.value && i !== index) {
                                                filter = false;
                                            }
                                        });
                                        return filter;
                                    }).map((option, key) => {
                                        return (<MenuItem key={key} value={option.value}>{option.label}</MenuItem>);
                                    })}
                                </Select>
                            </div>}
                            <div className="recovery-input">
                                <TextField
                                    fullWidth={true}
                                    label={i18n.t('settings.recovery.your_answer')}
                                    margin="dense"
                                    variant="outlined"
                                    onChange={this.answerChangeHandler(index)}
                                />
                            </div>
                        </React.Fragment>);
                    })}
                    <div className="recovery-gap"/>
                    <DialogActions>
                        <Button color="primary" onClick={this.modalCloseHandler}>
                            {i18n.t('general.cancel')}
                        </Button>
                        <Button color="secondary" autoFocus={true} onClick={this.submitHandler}
                                disabled={this.isInvalid()}>
                            {answer ? i18n.t('general.recover') : i18n.t('general.submit')}
                        </Button>
                    </DialogActions>
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            open: false,
        });
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    private questionChangeHandler = (index: number) => (e: any) => {
        const {questions} = this.state;
        if (questions[index]) {
            questions[index].id = e.target.value;
            if (questionOptions[e.target.value]) {
                questions[index].text = questionOptions[e.target.value].label;
            } else {
                questions[index].text = '';
            }
            this.setState({
                questions,
            });
        }
    }

    private answerChangeHandler = (index: number) => (e: any) => {
        const {questions} = this.state;
        if (questions[index]) {
            questions[index].answer = e.target.value;
            this.setState({
                questions,
            });
        }
    }

    private submitHandler = () => {
        if (this.props.onDone) {
            this.props.onDone(this.state.questions);
        }
        this.modalCloseHandler();
    }

    private isInvalid = () => {
        const {questions, answer} = this.state;
        let cnt = 0;
        questions.forEach((q) => {
            if (q.id !== -1) {
                cnt++;
            }
            if (q.answer !== '') {
                cnt++;
            }
        });
        return answer ? (cnt < 5) : (cnt < 6);
    }
}

export default RecoveryQuestionModal;
