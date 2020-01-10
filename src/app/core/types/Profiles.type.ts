export interface Profile {
    name: string;
    zeebe: {
        address: string;
        oAuthAvailable: boolean;
        oAuth?: {
            clientId: string;
            clientSecret: string;
            authzUrl: string;
        }
    }
    workflows?: Workflow[];
}

export interface Workflow {
    name: string;
    bpmnFile: string;
    workflowId: string;    
    payload?: string;
}
