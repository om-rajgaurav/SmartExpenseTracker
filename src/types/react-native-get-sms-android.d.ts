declare module 'react-native-get-sms-android' {
  export interface SmsFilter {
    box?: string;
    indexFrom?: number;
    maxCount?: number;
    address?: string;
    body?: string;
    read?: number;
    _id?: number;
    date?: number;
  }

  export interface SmsMessage {
    _id: string;
    thread_id: string;
    address: string;
    person: string;
    date: string;
    date_sent: string;
    protocol: string;
    read: string;
    status: string;
    type: string;
    body: string;
    service_center: string;
    locked: string;
    error_code: string;
    sub_id: string;
    seen: string;
    deletable: string;
    sim_slot: string;
    hidden: string;
    app_id: string;
    msg_id: string;
    reserved: string;
    pri: string;
    teleservice_id: string;
    svc_cmd: string;
    roam_pending: string;
    spam_report: string;
    secret_mode: string;
    safe_message: string;
    favorite: string;
  }

  export function list(
    filter: string,
    fail: (error: string) => void,
    success: (count: number, smsList: string) => void,
  ): void;

  function deleteSms(
    _id: number,
    fail: (error: string) => void,
    success: () => void,
  ): void;
  
  export { deleteSms as delete };

  export function autoSend(
    phoneNumber: string,
    message: string,
    fail: (error: string) => void,
    success: () => void,
  ): void;
}
