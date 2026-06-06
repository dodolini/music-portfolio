'use client';
import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  RadioGroup,
  Radio,
  Uploader,
  IconButton,
  Toggle,
  toaster,
  Message
} from 'rsuite';
import { useTranslations } from 'next-intl';
import { Trash } from '@rsuite/icons';

const { Column, HeaderCell, Cell } = Table;

// rsuite's IconButton props union is too large for TS to represent here, so we
// alias it to a simpler component type for this usage.
const IconBtn = IconButton as React.FC<{
  icon: React.ReactElement;
  size?: 'lg' | 'md' | 'sm' | 'xs';
  appearance?: 'default' | 'primary' | 'link' | 'subtle' | 'ghost';
  onClick?: () => void;
}>;

 export interface Beat {
  id: string;
  name: { pl: string; en: string };
  fileName?: string;
  plays: number;
  imageUrl?: string | null;
  main: boolean;
  fileUrl: string;
}

interface FileItem {
  name?: string;
  blobFile?: File;
  [key: string]: any;
}

export default function BeatsManagementPage() {
  const t = useTranslations('beats');
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [formValue, setFormValue] = useState<{
    namePl: string;
    nameEn: string;
    file: FileItem[];
    image: FileItem[];
    main: boolean;
  }>({
    namePl: '',
    nameEn: '',
    file: [],
    image: [],
    main: false
  });
  const [lang, setLang] = useState<'pl' | 'en'>('pl');

  useEffect(() => {
    fetchBeats();
  }, []);

  const fetchBeats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/beats', { method: 'GET', credentials: 'include' });
      const data: Beat[] = await res.json();
      setBeats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Upload a file straight from the browser to Cloudinary using a signature
  // obtained from our API. Keeps large audio files out of the serverless body.
  const uploadToCloudinary = async (file: File) => {
    const sigRes = await fetch('/api/cloudinary/sign', { credentials: 'include' });
    if (!sigRes.ok) throw new Error('Failed to get upload signature');
    const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', apiKey);
    fd.append('timestamp', String(timestamp));
    fd.append('signature', signature);
    fd.append('folder', folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: 'POST', body: fd }
    );
    if (!uploadRes.ok) throw new Error('Cloudinary upload failed');
    const data = await uploadRes.json();
    return { url: data.secure_url as string, publicId: data.public_id as string };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let filePayload = null;
      let imagePayload = null;

      if (formValue.file[0]?.blobFile) {
        filePayload = await uploadToCloudinary(formValue.file[0].blobFile);
      }
      if (formValue.image[0]?.blobFile) {
        imagePayload = await uploadToCloudinary(formValue.image[0].blobFile);
      }

      const res = await fetch('/api/beats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          namePl: formValue.namePl,
          nameEn: formValue.nameEn,
          main: formValue.main,
          file: filePayload,
          image: imagePayload,
        }),
      });

      if (!res.ok) throw new Error('Failed to save beat');

      await fetchBeats();
      setModalOpen(false);
      setEditingBeat(null);
      setFormValue({ namePl: '', nameEn: '', file: [], image: [], main: false });
    } catch (err) {
      console.error('Error saving beat:', err);
      toaster.push(
        <Message type="error" closable>
          {t('saveError')}
        </Message>,
        { placement: 'topEnd' }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (beatId: string) => {
    const res = await fetch(`/api/beats/${beatId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete beat');
    toaster.push(
      <Message type="success" closable>
        {t('beatDeleted')}
      </Message>,
      { placement: 'topEnd' }
    );
    await fetchBeats();
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button appearance="primary" onClick={() => setModalOpen(true)}>
          {t('addBeat')}
        </Button>
      </div>

      <Table data={beats} autoHeight loading={loading}>
        <Column flexGrow={1}>
          <HeaderCell>{t('name')}</HeaderCell>
          <Cell>{(rowData: Beat) => rowData.name[lang]}</Cell>
        </Column>
        <Column flexGrow={0.5}>
          <HeaderCell>{t('main')}</HeaderCell>
          <Cell>{(rowData: Beat) => (rowData.main ? t('yes') : t('no'))}</Cell>
        </Column>
        <Column width={140}>
          <HeaderCell>{t('plays')}</HeaderCell>
          <Cell dataKey="plays" />
        </Column>
        <Column width={120} align="center">
          <HeaderCell>{t('actions')}</HeaderCell>
          <Cell>
            {(rowData: Beat) => (
              <>
                <IconBtn
                  icon={<Trash style={{ color: 'red' }} />}
                  size="sm"
                  appearance="subtle"
                  onClick={() => handleDelete(rowData.id)}
                />
              </>
            )}
          </Cell>
        </Column>
      </Table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>
          <Modal.Title>{editingBeat ? t('editBeat') : t('addBeat')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid formValue={formValue} onChange={(v) => setFormValue(v as typeof formValue)}>
            <RadioGroup inline value={lang} onChange={(val) => setLang(val as 'pl' | 'en')}>
              <Radio value="pl">{t('polish')}</Radio>
              <Radio value="en">{t('english')}</Radio>
            </RadioGroup>

            {lang === 'pl' ? (
              <Form.Group>
                <Form.ControlLabel>{t('namePl')}</Form.ControlLabel>
                <Input
                  value={formValue.namePl}
                  onChange={(val) => setFormValue({ ...formValue, namePl: val })}
                />
              </Form.Group>
            ) : (
              <Form.Group>
                <Form.ControlLabel>{t('nameEn')}</Form.ControlLabel>
                <Input
                  value={formValue.nameEn}
                  onChange={(val) => setFormValue({ ...formValue, nameEn: val })}
                />
              </Form.Group>
            )}

            <Form.Group>
              <Form.ControlLabel>{t('main')}</Form.ControlLabel>
              <Toggle
                checked={formValue.main}
                onChange={(checked) => setFormValue({ ...formValue, main: checked })}
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>{t('file')}</Form.ControlLabel>
              <Uploader
                action=""
                autoUpload={false}
                fileList={formValue.file}
                onChange={(fileList) => setFormValue({ ...formValue, file: fileList })}
                accept="audio/mpeg,audio/wav,.mp3,.wav"
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>{t('image')}</Form.ControlLabel>
              <Uploader
                action=""
                autoUpload={false}
                fileList={formValue.image}
                listType="picture"
                onChange={(fileList) => setFormValue({ ...formValue, image: fileList })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave} appearance="primary" loading={saving}>{t('save')}</Button>
          <Button onClick={() => setModalOpen(false)} appearance="subtle" disabled={saving}>{t('cancel')}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
