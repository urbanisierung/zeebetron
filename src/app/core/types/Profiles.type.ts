export interface Profile {
    name: string;
    zeebe: {
        address: string;
        oAuth?: {
            clientId: string;
            clientSecret: string;
            authzUrl: string;
        }
    }
    workflows?: Workflow[];
}

export interface Workflow {
    bpmnFile: string;
    workflowId: string;
    payload?: string;
}