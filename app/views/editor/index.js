import React, {Component} from 'react';
import brace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import Terminal from 'terminal-in-react';
import AceEditor from 'react-ace';
import fse from 'fs-extra';
import Path from 'path';
import Platform from 'Platform';
import InputControl from '../../components/input-control';
import Button from '../../components/button';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Modal from '../../components/modal';
import Lang from '../../lang';
import Store from '../../utils/store';

let cliMessage = 'Electron 测试运行环境。输入 "help" 查看可用命令。\n';
Object.keys(process.versions).forEach(name => {
    cliMessage += `\n${name}: ${process.versions[name]}`;
});

class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jsFiles: Store.get('electron-run:jsFile', ''),
            code: Store.get('electron-run:code', 'console.log(fileModule1);'),
            running: false
        };

        this.saveFile = Path.join(Platform.env.dataPath, 'electron-run-code.js');
        console.log('Electron-Run: save path', this.saveFile);
    }

    handleCodeChange = (code) => {
        this.setState({code});
    }

    handleLoadBtnClick = () => {
        Platform.dialog.showRemoteOpenDialog({
            filters: [
                {name: 'JavaScript file', extensions: ['js']},
                {name: 'Node module', extensions: ['node']},
            ],
            defaultPath: this.state.jsFiles && this.state.jsFiles.length ? Path.dirname(this.state.jsFiles[0]) : null
        }, (files) => {
            this.setState({jsFiles: files});
            console.log('Electron-Run: Load code file', files);
        });
    }

    handleRemoveLoadClick = () => {
        this.setState({jsFiles: null});
    }

    handleRunBtnClick = () => {
        let code = '';
        if (this.state.jsFiles && this.state.jsFiles.length) {
            this.state.jsFiles.forEach((file, idx) => {
                code += `var fileModule${idx + 1} = require('${Path.normalize(file).replace(/\\/g, '\\\\')}');\n`;
            });
        } else {
            code += 'var fileModule1;\n\n';
        }
        code += this.state.code;
        this.setState({running: true});
        Store.set('electron-run:jsFile', this.state.jsFiles);
        Store.set('electron-run:code', this.state.code);
        fse.outputFile(this.saveFile, code).then(() => {
            return new Promise((resolve, reject) => {
                try {
                    console.log('Electron-Runner: Run Code: ', {code});
                    delete __non_webpack_require__.cache[this.saveFile];
                    var data = __non_webpack_require__(this.saveFile);
                    console.log('Electron-Runner: Result', data);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        }).then(() => {
            this.setState({running: false});
        }).catch(error => {
            console.error('Electron-Runner: Error:', error);
            Modal.alert('运行过程中发生了一些错误' + Lang.error(error));
            this.setState({running: false});
        });
    }

    render() {
        const {
            className,
            children,
            ...other
        } = this.props;

        return (<div className={HTML.classes('editor row single', className)}>
            <div className="column single cell-6">
                <header className="has-padding single row flex-none divider">
                    <InputControl value={this.state.jsFiles && this.state.jsFiles.join(',')} label={false} className="flex-auto no-margin" />
                    <Button onClick={this.handleLoadBtnClick} className="primary outline rounded space-left flex-none">从文件加载代码（.node,.js）</Button>
                    <Button disabled={!this.state.jsFiles || !this.state.jsFiles.length} onClick={this.handleRemoveLoadClick} className="primary outline rounded space-left flex-none">清除</Button>
                </header>
                <AceEditor
                    width="100%"
                    className="flex-auto"
                    mode="javascript"
                    theme="github"
                    name="blah2"
                    onLoad={null}
                    onChange={this.handleCodeChange}
                    fontSize={14}
                    showPrintMargin
                    showGutter
                    highlightActiveLine
                    value={this.state.code}
                    setOptions={{
                        enableBasicAutocompletion: false,
                        enableLiveAutocompletion: false,
                        enableSnippets: false,
                        showLineNumbers: true,
                        tabSize: 4,
                    }}
                />
                <div className="has-padding flex-none row single">
                    <Button disabled={this.state.running} onClick={Platform.ui.openDevTools} className="primary outline rounded flex-none">打开控制台</Button>
                    <div className="has-padding-sm flex-none" />
                    <Button disabled={this.state.running} onClick={this.handleRunBtnClick} className="primary rounded flex-auto">立即运行</Button>
                </div>
            </div>
            <div className="cell-6 relative">
                <div className="dock scroll-y user-selectable" style={{padding: '10px 5px', background: '#e5e5e5'}}>
                    <Terminal
                        hideTopBar
                        color="#333"
                        backgroundColor="#e5e5e5"
                        barColor="black"
                        watchConsoleLogging
                        commands={{
                            run: () => {
                                this.handleRunBtnClick();
                            },
                            load: () => {
                                this.handleLoadBtnClick();
                            },
                            'open-dev': Platform.ui.openDevTools
                        }}
                        descriptions={{
                            run: '立即运行左侧加载的文件和编辑器中的代码。',
                            load: '从本地选择一个文件并准备运行。',
                            'open-dev': '打开开发人员工具。'
                        }}
                        msg={cliMessage}
                    />
                </div>
            </div>
        </div>);
    }
}

export default Editor;
