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

 export interface Beat {
  id: string;
  name: { pl: string; en: string };
  fileName: string;
  plays: number;
  imageUrl?: string;
  main: boolean;
  fileUrl: string;
}

interface FileItem {
  name: string;
  blobFile: File;
  [key: string]: any;
}

export default function BeatsManagementPage() {
  const t = useTranslations('beats');
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(false);
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
      const res = await fetch('http://localhost:4000/beats/list', { method: 'GET', credentials: 'include' });
      const data: Beat[] = await res.json();
      setBeats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('namePl', formValue.namePl);
      formData.append('nameEn', formValue.nameEn);
      formData.append('main', String(formValue.main));

      if (formValue.file[0]?.blobFile) formData.append('file', formValue.file[0].blobFile);
      if (formValue.image[0]?.blobFile) formData.append('image', formValue.image[0].blobFile);

      const url = editingBeat
        ? `http://localhost:4000/beats/update/${editingBeat.id}`
        : 'http://localhost:4000/beats/create';

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to save beat');

      await fetchBeats();
      setModalOpen(false);
      setEditingBeat(null);
      setFormValue({ namePl: '', nameEn: '', file: [], image: [], main: false });
    } catch (err) {
      console.error('Error saving beat:', err);
    }
  };

  const handleDelete = async (beatId: string) => {
    const res = await fetch(`http://localhost:4000/beats/delete/${beatId}`, { method: 'DELETE' });
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
                <IconButton
                  icon={<Trash />}
                  size="sm"
                  appearance="subtle"
                  color="red"
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
          <Form fluid formValue={formValue} onChange={setFormValue}>
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
                autoUpload={false}
                fileList={formValue.file}
                onChange={(fileList) => setFormValue({ ...formValue, file: fileList })}
                accept="audio/mpeg,audio/wav,.mp3,.wav"
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>{t('image')}</Form.ControlLabel>
              <Uploader
                autoUpload={false}
                fileList={formValue.image}
                listType="picture"
                onChange={(fileList) => setFormValue({ ...formValue, image: fileList })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave} appearance="primary">{t('save')}</Button>
          <Button onClick={() => setModalOpen(false)} appearance="subtle">{t('cancel')}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
