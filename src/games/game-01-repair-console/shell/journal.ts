/**
 * Canned boot journal for the "northbridge" robot. Full of ordinary noise so
 * that a bare `journalctl` is overwhelming, and `grep ERROR` narrows it down
 * to the handful of lines that actually explain the fault (nb_motor_left,
 * permission denied on nb_init.sh).
 */
export const JOURNAL_LOG: string[] = [
  'Jul 29 06:02:01 northbridge kernel: Booting Linux on physical CPU 0x0',
  'Jul 29 06:02:01 northbridge kernel: Memory: 512MB available',
  'Jul 29 06:02:02 northbridge systemd[1]: systemd 255 running in system mode',
  'Jul 29 06:02:02 northbridge systemd[1]: Starting Load Kernel Modules...',
  'Jul 29 06:02:02 northbridge systemd[1]: Finished Load Kernel Modules.',
  'Jul 29 06:02:03 northbridge systemd[1]: Starting Network Configuration...',
  'Jul 29 06:02:03 northbridge NetworkManager[142]: device (eth0): link connected',
  'Jul 29 06:02:03 northbridge systemd[1]: Finished Network Configuration.',
  'Jul 29 06:02:04 northbridge kernel: usb 1-1: new high-speed USB device',
  'Jul 29 06:02:04 northbridge kernel: fan_ctrl: module loaded',
  'Jul 29 06:02:04 northbridge kernel: display_hdmi: module loaded',
  'Jul 29 06:02:05 northbridge systemd[1]: Starting Driver Init Service...',
  'Jul 29 06:02:05 northbridge nb_init[203]: loading drivers/nb_core.ko',
  'Jul 29 06:02:05 northbridge kernel: nb_core: module loaded, northbridge online',
  'Jul 29 06:02:05 northbridge sensors[88]: battery: 91% (charging)',
  'Jul 29 06:02:06 northbridge sensors[88]: solar array: 12.4W',
  'Jul 29 06:02:06 northbridge nb_init[203]: loading drivers/nb_balance.ko',
  'Jul 29 06:02:06 northbridge kernel: nb_balance: module loaded',
  'Jul 29 06:02:07 northbridge nb_init[203]: loading drivers/nb_motor_right.ko',
  'Jul 29 06:02:07 northbridge kernel: nb_motor_right: module loaded',
  'Jul 29 06:02:08 northbridge bash[204]: /drivers/nb_init.sh: permission denied',
  'Jul 29 06:02:08 northbridge nb_init[203]: ERROR: cannot exec drivers/nb_init.sh: permission denied',
  'Jul 29 06:02:08 northbridge kernel: nb_motor_left: module load failed: dependency script did not run',
  'Jul 29 06:02:08 northbridge systemd[1]: nb-driver-init.service: ERROR: main process exited, code=exited status=126',
  'Jul 29 06:02:08 northbridge systemd[1]: ERROR: motor subsystem disabled: nb_motor_left did not come up',
  'Jul 29 06:02:08 northbridge systemd[1]: Failed to start Driver Init Service.',
  'Jul 29 06:02:09 northbridge systemd[1]: Starting Thermal Management...',
  'Jul 29 06:02:09 northbridge sensors[88]: cpu temp: 41C',
  'Jul 29 06:02:09 northbridge systemd[1]: Finished Thermal Management.',
  'Jul 29 06:02:10 northbridge systemd[1]: Startup finished in 9.312s',
];
