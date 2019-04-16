"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { CompilerBase } from "./compilerBase";

export class BatariBasicCompiler extends CompilerBase {
    
    constructor() {
        super("batariBasic","batari Basic",[".bas",".bb"],path.join(application.Path,"out","bin","compilers","bb"));
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:BatariBasicCompiler.ExecuteCompilerAsync');

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Compiler options
        let commandName = "2600bas.bat";
        if (application.IsLinux || application.IsMacOS) {
            // Linux or MacOS
            commandName = "./2600basic.sh";
        }
        
        // Compiler options
        let command = path.join(this.FolderOrPath, commandName);
        let args = [
            `"${this.FileName}"`,
            this.Args
        ];

        // Compiler environment
        let env : { [key: string]: string | null } = {};
        env["PATH"] = this.FolderOrPath;
        if (application.IsLinux || application.IsMacOS) {
            // Additional for Linux or MacOS
            env["PATH"] = ":/bin:/usr/bin:" + env["PATH"];
        }
        env["bB"] = this.FolderOrPath;
    
        // Process
        this.outputChannel.appendLine(`Building '${this.FileName}'...`); 

        // Compile
        this.IsRunning = true;
        let executeResult = await execute.Spawn(command, args, env, this.WorkspaceFolder,
            (stdout: string) => {
                // Prepare
                let result = true;

                // Validate (batari Basic)
                if (stdout.includes("Compilation failed") || stdout.includes("error:")) {
                    // bB messages received (so far):
                    // Compilation failed
                    // error: Origin Reverse-indexed
                    // Fatal assembly error: Source is not resolvable.
                    // error: Unknown Mnemonic 'x'
                    // Unrecoverable error(s) in pass, aborting assembly!
                     
                     // Failed
                    result = false;
                }

                // Result
                this.outputChannel.append('' + stdout);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = true;

                // Validate (batari basic)
                if (stderr.includes("2600 Basic compilation complete.")) {
                    // Ok - bB throws out standard message here that it shouldn't so we need to verify everything arrr...

                } else if (stderr.includes("User-defined score_graphics.asm found in current directory")) {
                    // Ok - bB throws out standard message here that it shouldn't so we need to verify everything arrr...

                } else if (stderr.includes("Parse error") || stderr.includes("error:")) {
                    // bB messages received (so far):
                    // Parse error
                    // Error: 
                     
                     // Failed
                     result = false;

                } else if (stderr.includes("Cannot open includes.bB for reading")) {
                    // Special - seen this when the source is not processed correctly so we'll advise
                    // obviously doesn't get to the point of copying over this file
                    this.outputChannel.appendLine("WARNING: An unknown issue has occurred during compilation that may have affected your build....");

                     // Failed
                     result = false;
                }

                // Result
                this.outputChannel.append('' + stderr);
                return result;
            });
        this.IsRunning = false;

        // Validate
        if (!executeResult) return false;

        // Verify file size
        if (await !this.VerifyCompiledFileSizeAsync()) return false;

        // Clean up file(s) creating during compilation
        if (await !this.RemoveCompilationFilesAsync()) return false;

        // Move file(s) to Bin folder
        if (await !this.MoveFilesToBinFolderAsync()) return false;

        // Result
        return true;
    }

    // protected LoadConfiguration(): boolean {
    //     console.log('debugger:BatariBasicCompiler.LoadConfiguration');  

    //     // Base
    //     if (!super.LoadConfiguration()) return false;

    //     // Result
    //     return true;
    // }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:BatariBasicCompiler.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) return true;

        // Prepare
        let architecture = "Linux";
        if (application.IsMacOS) architecture = "Darwin";

        // Process
        let result = await filesystem.SetChMod(path.join(this.FolderOrPath,'2600basic.sh'));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`2600basic.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`dasm.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`bbfilter.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`optimize.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`postprocess.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`preprocess.${architecture}.x86`));
        return result;
    }

    protected async RemoveCompilationFilesAsync(): Promise<boolean> {
        console.log('debugger:BatariBasicCompiler.RemoveCompilationFilesAsync');

        // Notify
        this.notify(`Cleaning up files generated during compilation...`);

        // Language specific files
        if (this.CleanUpCompilationFiles)  {
            // Process
            await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`${this.FileName}.asm`));
            await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`bB.asm`));
            await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`includes.bB`));
            await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`2600basic_variable_redefs.h`));
        }

        // Debugger files (from workspace not bin)
        // Note: Remove if option is turned off as they are generated by bB (cannot change I believe)
        if (!this.GenerateDebuggerFiles) {
            await this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
        }

        // Result
        return true;
    }
}